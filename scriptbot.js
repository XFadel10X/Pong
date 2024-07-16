// scriptbot.js

const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const timerDisplay = document.getElementById('timer');
const winnerDisplay = document.getElementById('winner');
const sliderThumb = document.getElementById('slider-thumb');
const sliderLine = document.getElementById('slider-line');

const ballSpeedX = 6.5;
const ballSpeedY = 6.5;
const aiReactiveness = 0.25;
const maxAIPaddleSpeed = 6;
const gameDuration = 60;

let ballX = 400;
let ballY = 200;
let ballDirectionX = Math.random() < 0.5 ? 1 : -1;
let ballDirectionY = Math.random() < 0.5 ? 1 : -1;
let score1 = 0;
let score2 = 0;
let gameStartTime = Date.now();
let gameOver = false;

let isDragging = false;
let sliderStartX = 0;

// Événements de glissement tactile
sliderThumb.addEventListener('touchstart', (e) => {
    isDragging = true;
    sliderStartX = e.touches[0].clientX - sliderThumb.offsetLeft;
});

document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        e.preventDefault(); // Empêche le défilement par défaut sur les appareils tactiles
        let posX = e.touches[0].clientX - sliderStartX;
        const sliderWidth = sliderLine.clientWidth - sliderThumb.clientWidth;

        if (posX < 0) {
            posX = 0;
        } else if (posX > sliderWidth) {
            posX = sliderWidth;
        }

        const percent = posX / sliderWidth;
        const maxX = sliderLine.clientWidth - sliderThumb.clientWidth;
        const newLeft = percent * maxX;
        sliderThumb.style.left = `${newLeft}px`;

        const paddleX = newLeft + sliderThumb.clientWidth / 2;
        playerPaddle.style.left = `${paddleX}px`;
    }
});

document.addEventListener('touchend', () => {
    isDragging = false;
});

function moveAIPaddle() {
    const aiPaddleTop = parseInt(aiPaddle.style.top) || 0;
    const ballTop = ballY - ball.clientHeight / 2;
    const distance = ballTop - (aiPaddleTop + aiPaddle.clientHeight / 2);

    const moveAmount = aiReactiveness * distance;
    aiPaddle.style.top = `${aiPaddleTop + Math.sign(moveAmount) * Math.min(maxAIPaddleSpeed, Math.abs(moveAmount))}px`;
}

function moveBall() {
    ballX += ballSpeedX * ballDirectionX;
    ballY += ballSpeedY * ballDirectionY;

    if (ballY >= 380 || ballY <= 0) {
        ballDirectionY *= -1;
    }

    if (ballX <= 40 && ballY >= parseInt(playerPaddle.style.top) && ballY <= parseInt(playerPaddle.style.top) + playerPaddle.clientHeight) {
        ballDirectionX *= -1;
    } else if (ballX >= 740 && ballY >= parseInt(aiPaddle.style.top) && ballY <= parseInt(aiPaddle.style.top) + aiPaddle.clientHeight) {
        ballDirectionX *= -1;
    } else if (ballX <= 0 || ballX >= 780) {
        updateScore();
        resetBall();
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}

function resetBall() {
    ballX = 400;
    ballY = 200;
    ballDirectionX = Math.random() < 0.5 ? 1 : -1;
    ballDirectionY = Math.random() < 0.5 ? 1 : -1;
}

function updateScore() {
    if (ballX <= 0) {
        score2++;
        score2Display.textContent = score2;
    } else if (ballX >= 780) {
        score1++;
        score1Display.textContent = score1;
    }
}

function gameLoop() {
    if (gameOver) return;

    moveAIPaddle();
    moveBall();

    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const timeLeft = gameDuration - elapsedTime;
    timerDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
        endGame();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function endGame() {
    gameOver = true;
    if (score1 > score2) {
        winnerDisplay.textContent = "L'Humain a Gagné !";
    } else if (score2 > score1) {
        winnerDisplay.textContent = "L'IA a Gagné !";
    } else {
        winnerDisplay.textContent = 'Égalité';
    }
    winnerDisplay.style.display = 'block';
}

function initEventListeners() {
    aiPaddle.addEventListener('click', () => {
        window.location.href = 'https://chat-jai-pete.fr/';
    });
}

function initializeGame() {
    playerPaddle.style.top = '150px';
    aiPaddle.style.top = '150px';
    resetBall();
}

initializeGame();
initEventListeners();
gameLoop();

document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
