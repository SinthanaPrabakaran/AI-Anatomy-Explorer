from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from google import genai
import json
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Gemini client
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("⚠️ Warning: GEMINI_API_KEY not found in environment variables!")
else:
    client = genai.Client(api_key=api_key)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not api_key:
            return jsonify({
                'status': 'error',
                'message': 'API key not configured'
            }), 500
            
        data = request.json
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'status': 'error',
                'message': 'No message provided'
            }), 400
        
        # Prepare the chat prompt
        prompt = f"You are a helpful anatomy teacher. Give concise answers.\n\nQuestion: {message}"
        
        # Generate response using the client
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        return jsonify({
            'status': 'success',
            'response': response.text
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/quiz', methods=['POST'])
def generate_quiz():
    try:
        if not api_key:
            return jsonify({
                'status': 'error',
                'message': 'API key not configured'
            }), 500
            
        data = request.json
        organ = data.get('organ', 'heart')
        difficulty = data.get('difficulty', 'medium')
        num_questions = data.get('num_questions', 10)
        
        # Prepare the quiz generation prompt
        prompt = f"""
        You are an expert anatomy teacher.
        Generate a multiple-choice quiz of {num_questions} questions about the **{organ}**.
        Difficulty level: {difficulty}.
        Focus on its structure, parts, and functions.

        Format your response strictly as JSON:
        [
            {{
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "answer": "Correct option letter",
                "explanation": "One-line explanation of the answer"
            }},
            ...
        ]
        """
        
        # Generate quiz using the client
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )
        
        # Get the text response and clean it
        text_response = response.text.strip()
        
        # Clean Markdown formatting if model wrapped output in ```json ... ```
        cleaned_text = re.sub(r"```(?:json)?", "", text_response, flags=re.IGNORECASE).strip()
        cleaned_text = re.sub(r"```", "", cleaned_text).strip()
        
        # Try to parse as JSON
        try:
            quiz_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            # If parsing fails, return error with raw response
            print(f"Failed to parse quiz response as JSON. Raw response: {text_response}")
            return jsonify({
                'status': 'error',
                'message': 'Failed to parse quiz response',
                'raw_response': text_response
            }), 500
        
        return jsonify({
            'status': 'success',
            'quiz': quiz_data
        })
    except Exception as e:
        print(f"Error in quiz endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)