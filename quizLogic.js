// Configuration
const API_ENDPOINT = 'https://api.jsonserve.com/Uw5CrX';
const FALLBACK_QUESTIONS = [
    {
        question: "What is the capital of France?",
        answers: ["London", "Paris", "Berlin", "Madrid"],
        correct: 1
    },
    {
        question: "Which planet is closest to the Sun?",
        answers: ["Venus", "Mercury", "Mars", "Earth"],
        correct: 1
    }
];

// State management
let quizState = {
    currentQuestion: 0,
    score: 0,
    timeLeft: 30,
    timerId: null,
    questions: [],
    leaderboard: []
};

// DOM elements
const domElements = {
    questionText: document.getElementById('question-text'),
    answersGrid: document.getElementById('answers-grid'),
    scoreElement: document.getElementById('score'),
    timerElement: document.getElementById('timer'),
    progressFill: document.querySelector('.progress-fill'),
    loadingOverlay: document.getElementById('loading-overlay'),
    leaderboardList: document.getElementById('leaderboard-list')
};

// Fetch questions from API
async function fetchQuestions() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('API response error');
        
        const data = await response.json();
        if (!data.questions || !data.questions.length) {
            throw new Error('Invalid question format');
        }
        
        return data.questions;
    } catch (error) {
        console.error('Using fallback questions:', error);
        return FALLBACK_QUESTIONS;
    }
}

// Initialize quiz
async function initializeQuiz() {
    showLoading(true);
    
    try {
        quizState.questions = await fetchQuestions();
        setupEventListeners();
        startTimer();
        showQuestion();
    } catch (error) {
        alert('Failed to load questions. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Show/hide loading overlay
function showLoading(show) {
    domElements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Set up event listeners
function setupEventListeners() {
    domElements.answersGrid.addEventListener('click', handleAnswer);
}

// Display current question
function showQuestion() {
    const question = quizState.questions[quizState.currentQuestion];
    domElements.questionText.textContent = question.question;
    
    domElements.answersGrid.innerHTML = question.answers
        .map((answer, index) => `
            <button class="answer-btn" data-index="${index}" aria-label="Answer ${index + 1}: ${answer}">
                ${answer}
            </button>
        `).join('');
    
    updateProgress();
}

// Handle answer selection
function handleAnswer(event) {
    const button = event.target.closest('.answer-btn');
    if (!button || button.disabled) return;

    const selectedIndex = parseInt(button.dataset.index);
    const correctIndex = quizState.questions[quizState.currentQuestion].correct;
    const isCorrect = selectedIndex === correctIndex;

    // Visual feedback
    button.classList.add(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) quizState.score += 10;
    
    // Update score display
    domElements.scoreElement.textContent = quizState.score;
    
    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.index) === correctIndex) {
            btn.classList.add('correct');
        }
    });

    // Move to next question
    setTimeout(() => {
        quizState.currentQuestion++;
        if (quizState.currentQuestion < quizState.questions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Update progress bar
function updateProgress() {
    const progress = (quizState.currentQuestion / quizState.questions.length) * 100;
    domElements.progressFill.style.width = `${progress}%`;
}

// Start timer
function startTimer() {
    quizState.timerId = setInterval(() => {
        quizState.timeLeft--;
        domElements.timerElement.textContent = quizState.timeLeft;
        
        if (quizState.timeLeft <= 0) {
            endQuiz();
        }
    }, 1000);
}

// End quiz
function endQuiz() {
    clearInterval(quizState.timerId);
    alert(`Quiz Over! Your final score: ${quizState.score}`);
    updateLeaderboard(quizState.score);
    resetQuiz();
}

// Update leaderboard
function updateLeaderboard(score) {
    quizState.leaderboard.push(score);
    quizState.leaderboard.sort((a, b) => b - a);
    quizState.leaderboard = quizState.leaderboard.slice(0, 5); // Keep top 5 scores

    domElements.leaderboardList.innerHTML = quizState.leaderboard
        .map((score, index) => `<li>${index + 1}. ${score} points</li>`)
        .join('');
}

// Reset quiz
function resetQuiz() {
    quizState = {
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        timerId: null,
        questions: [],
        leaderboard: quizState.leaderboard
    };
    domElements.timerElement.textContent = quizState.timeLeft;
    initializeQuiz();
}

// Start the quiz
initializeQuiz();