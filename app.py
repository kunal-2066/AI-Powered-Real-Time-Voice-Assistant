from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import ollama

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on("user_text")
def handle_user_text(data):
    try:
        user_text = data["text"]
        print("User:", user_text)

        response = ollama.chat(
            model="gpt-oss:120b-cloud",
            messages=[
        {
            "role": "system",
            "content": (
                "You are a custom AI voice assistant created for a college project. "
                "You are NOT ChatGPT. "
                "Never mention OpenAI or ChatGPT. "
                "If asked who you are, say: "
                "'I am your personal AI voice assistant.' "
                "Be concise and friendly."
            ),
        },
        {"role": "user", "content": user_text},
    ]
        )

        reply = response["message"]["content"]
        print("AI:", reply)

        emit("ai_reply", {"text": reply})

    except Exception as e:
        print("Error:", e)
        emit("ai_reply", {"text": "Sorry, something went wrong."})

@socketio.on("connect")
def connect():
    print("Client connected")

@socketio.on("disconnect")
def disconnect():
    print("Client disconnected")

if __name__ == "__main__":
    socketio.run(app, debug=True)
