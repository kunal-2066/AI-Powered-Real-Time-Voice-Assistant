from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests
import logging

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "tinyllama"


@socketio.on("connect")
def handle_connect():
    logger.info("Client connected")
    emit("status", {"message": "Connected to AI Voice Assistant backend"})


@socketio.on("disconnect")
def handle_disconnect():
    logger.info("Client disconnected")


@socketio.on("user_message")
def handle_message(data):
    user_input = data.get("text", "").strip()
    if not user_input:
        emit("ai_response", {"text": "I did not receive any input. Please try again."})
        return

    logger.info("User input: %s", user_input)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": user_input,
                "stream": False,
            },
            timeout=60,
        )
        response.raise_for_status()
        result = response.json()
        ai_text = result.get("response", "").strip()
        if not ai_text:
            ai_text = "I could not generate a response. Please try again."
    except requests.exceptions.ConnectionError:
        ai_text = (
            "Unable to connect to the AI model. "
            "Please make sure Ollama is running with: ollama serve"
        )
    except requests.exceptions.Timeout:
        ai_text = "The AI model took too long to respond. Please try again."
    except Exception as exc:
        logger.error("Error calling Ollama: %s", exc)
        ai_text = "An error occurred while processing your request. Please try again."

    logger.info("AI response: %s", ai_text)
    emit("ai_response", {"text": ai_text})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
