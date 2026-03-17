# AI-Powered Real-Time Voice Assistant

The AI-Powered Real-Time Voice Assistant is a voice-based application that allows users to interact with an AI system entirely through speech. The user provides input using voice, and the system processes the request and responds with spoken audio in real time.

Unlike traditional chatbots that rely on typing and text responses, this system is designed to work as an audio-only assistant, where communication happens through voice input and audio output.

## Features

- **Voice Input** – Captures user speech using the browser's built-in Speech Recognition API.
- **AI Processing** – Uses a locally running AI model through [Ollama](https://ollama.com) to generate responses.
- **Audio Output** – Converts AI responses into speech using the browser's Text-to-Speech API.
- **Real-Time Interaction** – Uses WebSockets for fast, low-latency communication between frontend and backend.
- **Audio-Only Interface** – No typing or reading required; fully hands-free.
- **Local AI Model** – Avoids paid APIs and improves privacy.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React.js, Browser Speech APIs       |
| Backend   | Python, Flask, Flask-SocketIO        |
| AI Model  | Ollama (local language model)       |
| Transport | WebSockets (Socket.IO)              |

## System Architecture

```
User speaks → Browser Speech Recognition → Text
    → WebSocket → Flask Backend
    → Ollama (local AI model) → Response text
    → WebSocket → React Frontend
    → Browser Text-to-Speech → Audio played to user
```

## Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- [Ollama](https://ollama.com) installed and running

### 1. Clone the repository

```bash
git clone https://github.com/kunal-2066/AI-Powered-Real-Time-Voice-Assistant.git
cd AI-Powered-Real-Time-Voice-Assistant
```

### 2. Start the Backend

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The backend starts on `http://localhost:5000`.

### 3. Start the Frontend

```bash
cd client
npm install
npm start
```

The frontend opens at `http://localhost:3000`.

### 4. Run Ollama

```bash
ollama serve
ollama pull tinyllama
```

> You can replace `tinyllama` with any model supported by Ollama (e.g. `llama3`, `mistral`).
> Update `OLLAMA_MODEL` in `backend/app.py` to match your chosen model.

## Usage

1. Open `http://localhost:3000` in **Google Chrome** or **Microsoft Edge** (required for Speech Recognition API).
2. Allow microphone access when prompted.
3. Click the **microphone button**.
4. Speak your question or command.
5. The assistant processes your speech and responds with voice.

## Project Structure

```
AI-Powered-Real-Time-Voice-Assistant/
├── backend/
│   ├── app.py              # Flask + Flask-SocketIO server, Ollama integration
│   └── requirements.txt    # Python dependencies
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js        # React entry point
│       ├── App.js          # Main component: speech recognition, TTS, WebSocket
│       └── App.css         # Styles
├── .gitignore
└── README.md
```

## Configuration

| Setting        | Location              | Default              |
|----------------|-----------------------|----------------------|
| Ollama model   | `backend/app.py`      | `tinyllama`          |
| Ollama URL     | `backend/app.py`      | `http://localhost:11434` |
| Backend port   | `backend/app.py`      | `5000`               |
| Frontend port  | `client/package.json` | `3000`               |

## Browser Support

The Speech Recognition API is supported in:
- ✅ Google Chrome
- ✅ Microsoft Edge
- ❌ Firefox (not supported)
- ❌ Safari (partial support)

## Future Enhancements

- Multi-language support
- Mobile application version
- Improved noise handling
- Voice personalization
- Offline speech recognition

## Author

Developed as part of MCA Project Work (MPRJ384).
