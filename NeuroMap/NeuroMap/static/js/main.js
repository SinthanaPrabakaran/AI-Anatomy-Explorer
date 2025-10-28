// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-message');
const sendButton = document.getElementById('send-message');
const quizContainer = document.getElementById('quiz-container');
const quizQuestions = document.getElementById('quiz-questions');
const generateQuizBtn = document.getElementById('generate-quiz');
const submitQuizBtn = document.getElementById('submit-quiz');
const quizResults = document.getElementById('quiz-results');

// Quiz state
let currentQuiz = [];
let selectedAnswers = {};

// Chat functionality
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage('user', message);
    userInput.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (data.status === 'success') {
            addMessage('assistant', data.response);
        } else {
            addMessage('system', 'Sorry, I encountered an error. Please try again.');
        }
    } catch (error) {
        addMessage('system', 'Sorry, I encountered an error. Please try again.');
    }
}

function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quiz functionality
async function generateQuiz() {
    const organ = document.getElementById('organ-select').value;
    const difficulty = document.getElementById('difficulty-select').value;
    const numQuestions = parseInt(document.getElementById('num-questions-select').value);

    try {
        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                organ,
                difficulty,
                num_questions: numQuestions
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            // data.quiz is already a parsed JSON object, not a string
            currentQuiz = data.quiz;
            displayQuiz(currentQuiz);
        } else {
            alert('Failed to generate quiz. Please try again. Error: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        alert('Failed to generate quiz. Please try again.');
    }
}

function displayQuiz(quiz) {
    quizQuestions.innerHTML = '';
    selectedAnswers = {};

    quiz.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.setAttribute('data-question-index', index);
        questionDiv.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
            <div class="quiz-options">
                ${question.options.map((option, optIndex) => `
                    <button class="option-btn" data-question="${index}" data-option="${String.fromCharCode(65 + optIndex)}">
                        ${option}
                    </button>
                `).join('')}
            </div>
            <div class="quiz-explanation hidden" id="explanation-${index}">
                <p class="explanation-text">${question.explanation || 'No explanation available.'}</p>
            </div>
        `;
        quizQuestions.appendChild(questionDiv);
    });

    quizContainer.classList.remove('hidden');
    submitQuizBtn.classList.remove('hidden');
    quizResults.classList.add('hidden');
}

function handleOptionClick(event) {
    if (!event.target.classList.contains('option-btn')) return;

    const questionIndex = event.target.dataset.question;
    const selectedOption = event.target.dataset.option;

    // Remove previous selection for this question
    const questionOptions = document.querySelectorAll(`[data-question="${questionIndex}"]`);
    questionOptions.forEach(opt => opt.classList.remove('selected'));

    // Add selection to clicked option
    event.target.classList.add('selected');
    selectedAnswers[questionIndex] = selectedOption;
}

function submitQuiz() {
    let correct = 0;
    const total = currentQuiz.length;

    // Check answers and update UI
    currentQuiz.forEach((question, index) => {
        const options = document.querySelectorAll(`[data-question="${index}"]`);
        const selected = selectedAnswers[index];
        // Normalize the correct answer (trim, uppercase)
        const correctAnswer = String(question.answer).trim().toUpperCase();
        const explanationDiv = document.getElementById(`explanation-${index}`);

        // Debug logging (remove in production if needed)
        console.log(`Question ${index + 1}: Correct answer = "${correctAnswer}", Selected = "${selected}"`);

        options.forEach(option => {
            const optionLetter = option.dataset.option;
            // Remove all state classes
            option.classList.remove('correct', 'incorrect', 'selected');

            // Always highlight the correct answer
            if (optionLetter === correctAnswer) {
                option.classList.add('correct');
                console.log(`Option ${optionLetter} marked as CORRECT`);
            } 
            // If user selected this option and it's wrong, mark as incorrect
            else if (optionLetter === selected && selected !== correctAnswer) {
                option.classList.add('incorrect');
                console.log(`Option ${optionLetter} marked as INCORRECT`);
            }
        });

        // Show explanation for this question
        if (explanationDiv) {
            explanationDiv.classList.remove('hidden');
        }

        // Normalize selected answer for comparison
        const normalizedSelected = selected ? String(selected).trim().toUpperCase() : null;
        if (normalizedSelected === correctAnswer) correct++;
    });

    // Display results
    quizResults.innerHTML = `
        <h3>Quiz Results</h3>
        <p>You got ${correct} out of ${total} questions correct! (${Math.round(correct/total * 100)}%)</p>
    `;
    quizResults.classList.remove('hidden');
    submitQuizBtn.classList.add('hidden');
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

generateQuizBtn.addEventListener('click', generateQuiz);
submitQuizBtn.addEventListener('click', submitQuiz);
quizQuestions.addEventListener('click', handleOptionClick);