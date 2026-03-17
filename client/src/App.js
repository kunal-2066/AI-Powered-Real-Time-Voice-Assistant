import React, { useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import { io } from "socket.io-client";

// Connect to backend
const socket = io("http://localhost:5000");

export default function App() {

  // Handle backend events
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to backend");
    });

    // 🔊 Speak AI response (AUDIO ONLY)
    socket.on("ai_reply", (data) => {
      const utterance = new SpeechSynthesisUtterance(data.text);

      const voices = window.speechSynthesis.getVoices();
      utterance.voice =
        voices.find((v) => v.lang.startsWith("en")) || voices[0];

      utterance.rate = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    });

    return () => {
      socket.off("connect");
      socket.off("ai_reply");
    };
  }, []);

  // 🎙️ Start listening (VOICE → TEXT, hidden)
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      socket.emit("user_text", { text });
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
    };

    recognition.start();
  };

  // Simple UI: ONLY MIC BUTTON
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <IconButton
        color="primary"
        onClick={startListening}
        sx={{
          padding: "30px",
          boxShadow: 3,
          backgroundColor: "white",
        }}
      >
        <MicIcon sx={{ fontSize: "15rem" }} />
      </IconButton>
    </div>
  );
}
