# NeuroMap - Interactive Anatomy Learning Platform

A web-based platform for learning anatomy through interactive chat and quizzes powered by Google's Gemini AI.

## Features

- Interactive chatbot for anatomy-related questions
- Dynamic quiz generation for different organs/systems
- Multiple difficulty levels
- Immediate feedback and scoring
- Responsive design for all devices

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the project root with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

### Chat Assistant
- Type your anatomy-related questions in the chat sidebar
- Get instant, accurate responses from the AI assistant

### Quiz System
1. Select an organ/system (heart, brain, lungs, etc.)
2. Choose difficulty level (easy, medium, hard)
3. Click "Generate Quiz" to start
4. Select your answers and submit for immediate feedback

## Technical Stack

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- AI: Google Gemini API
- Styling: Custom CSS with responsive design