import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import "./App.css";

const BACKEND_URL = "http://localhost:5000";

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connecting...");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [browserSupported, setBrowserSupported] = useState(true);

  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const synthRef = useRef(window.speechSynthesis);
  const conversationEndRef = useRef(null);

  // Scroll to bottom of conversation on new messages
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Check browser support
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setBrowserSupported(false);
      setErrorMessage(
        "Your browser does not support the Speech Recognition API. " +
          "Please use Google Chrome or Microsoft Edge."
      );
    }
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setStatusMessage("Connected. Click the microphone to start.");
      setErrorMessage("");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setStatusMessage("Disconnected from server. Retrying...");
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      setStatusMessage("Cannot connect to backend. Is the server running?");
    });

    socket.on("status", (data) => {
      setStatusMessage(data.message || "Ready");
    });

    socket.on("ai_response", (data) => {
      const responseText = data.text || "";
      setIsProcessing(false);

      setConversation((prev) => [
        ...prev,
        { role: "assistant", text: responseText },
      ]);

      speakText(responseText);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Text-to-speech
  const speakText = useCallback((text) => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMessage("Ready. Click the microphone to speak again.");
    };
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Setup and start speech recognition
  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    // Stop ongoing speech before listening
    stopSpeaking();

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      finalTranscriptRef.current = "";
      setStatusMessage("Listening...");
      setErrorMessage("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }
      setTranscript(finalTranscriptRef.current || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      const captured = finalTranscriptRef.current;
      if (captured) {
        sendMessage(captured);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "no-speech") {
        setStatusMessage("No speech detected. Click the microphone to try again.");
      } else if (event.error === "not-allowed") {
        setErrorMessage(
          "Microphone access denied. Please allow microphone access and refresh."
        );
      } else {
        setErrorMessage(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.start();
  }, [stopSpeaking]);

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Send message to backend
  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      if (!socketRef.current?.connected) {
        setErrorMessage("Not connected to backend. Please wait for reconnection.");
        return;
      }

      setConversation((prev) => [...prev, { role: "user", text }]);
      setTranscript("");
      setIsProcessing(true);
      setStatusMessage("Processing your request...");

      socketRef.current.emit("user_message", { text });
    },
    []
  );

  // Handle mic button click
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else if (!isProcessing && !isSpeaking) {
      startListening();
    }
  }, [isListening, isProcessing, isSpeaking, startListening, stopListening]);

  const getMicButtonClass = () => {
    if (isListening) return "mic-button listening";
    if (isProcessing) return "mic-button processing";
    if (isSpeaking) return "mic-button speaking";
    if (!isConnected) return "mic-button disconnected";
    return "mic-button";
  };

  const getMicLabel = () => {
    if (isListening) return "Stop";
    if (isProcessing) return "Processing...";
    if (isSpeaking) return "Speaking...";
    return "Speak";
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Voice Assistant</h1>
        <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
          <span className="status-dot" />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      <main className="app-main">
        {errorMessage && (
          <div className="error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {!browserSupported ? (
          <div className="unsupported-message">
            <p>
              Speech recognition is not supported in your browser. Please use
              Google Chrome or Microsoft Edge.
            </p>
          </div>
        ) : (
          <>
            <div className="conversation-container" aria-live="polite">
              {conversation.length === 0 ? (
                <div className="empty-state">
                  <p>Click the microphone button and speak to start a conversation.</p>
                </div>
              ) : (
                conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
                  >
                    <span className="message-role">
                      {msg.role === "user" ? "You" : "Assistant"}
                    </span>
                    <p className="message-text">{msg.text}</p>
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="message assistant-message processing-indicator">
                  <span className="message-role">Assistant</span>
                  <p className="message-text">
                    <span className="dot-animation">...</span>
                  </p>
                </div>
              )}
              <div ref={conversationEndRef} />
            </div>

            {transcript && (
              <div className="live-transcript" aria-live="polite">
                <span>{transcript}</span>
              </div>
            )}

            <div className="controls">
              <button
                className={getMicButtonClass()}
                onClick={handleMicClick}
                disabled={!isConnected || isProcessing}
                aria-label={
                  isListening ? "Stop listening" : "Start listening"
                }
                title={
                  !isConnected
                    ? "Waiting for server connection..."
                    : isProcessing
                    ? "Processing..."
                    : isListening
                    ? "Click to stop"
                    : "Click to speak"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mic-icon"
                  aria-hidden="true"
                >
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5z" />
                  <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 11z" />
                </svg>
                <span className="mic-label">{getMicLabel()}</span>
              </button>

              {isSpeaking && (
                <button
                  className="stop-speaking-button"
                  onClick={stopSpeaking}
                  aria-label="Stop speaking"
                >
                  Stop Speaking
                </button>
              )}
            </div>

            <p className="status-message" aria-live="polite">
              {statusMessage}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
