# AI-Powered-Real-Time-Voice-Assistant
AI-Powered Real-Time Voice Assistant
Overview

The AI-Powered Real-Time Voice Assistant is a voice-based application that allows users to interact with an AI system entirely through speech. The user provides input using voice, and the system processes the request and responds with spoken audio in real time. This project demonstrates how modern speech technologies and artificial intelligence can be integrated to create a natural and hands-free human–computer interaction experience.

Unlike traditional chatbots that rely on typing and text responses, this system is designed to work as an audio-only assistant, where communication happens through voice input and audio output.

Features

Voice Input: Captures user speech using browser speech recognition.

AI Processing: Uses a locally running AI model through Ollama to generate responses.

Audio Output: Converts AI responses into speech using text-to-speech technology.

Real-Time Interaction: Uses WebSockets for fast communication between frontend and backend.

Audio-Only Interface: Eliminates the need for typing or reading text.

Local AI Model: Avoids paid APIs and improves privacy.

Tech Stack

Frontend

React.js

JavaScript

Browser Speech Recognition API

Browser Text-to-Speech API

Backend

Python

Flask

Flask-SocketIO

AI Model

Ollama (Local Language Model)

System Architecture

The system follows a client–server architecture:

User speaks into the microphone.

The browser converts speech into text.

The text is sent to the backend using WebSockets.

The backend sends the input to the AI model.

The AI generates a response.

The response is sent back to the frontend.

The browser converts the response into speech and plays it to the user.

Installation
1. Clone the repository
git clone https://github.com/yourusername/ai-voice-assistant.git
cd ai-voice-assistant
2. Start Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
3. Start Frontend
cd client
npm install
npm start
4. Run Ollama
ollama serve
Usage

Open the application in the browser.

Allow microphone access.

Click the microphone button.

Speak your question or command.

The assistant will process the request and respond with voice.

Future Enhancements

Multi-language support

Mobile application version

Improved noise handling

Voice personalization

Offline speech recognition

Author

Developed as part of MCA Project Work (MPRJ384).
