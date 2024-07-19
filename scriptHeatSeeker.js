const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const timerDisplay = document.getElementById('timer');
const winnerDisplay = document.getElementById('winner');
const paddleSliderMobile = document.getElementById('paddle-slider-mobile');
const gameContainer = document.querySelector('.game-container');

const initialBallSpeed = 15;
const aiReactiveness = 0.2;
const maxAIPaddleSpeed = 8;
const gameDuration = 90;

const gravity = 0.0;
const friction = 0.99;
const paddleBoost = 1.5;

let ballX = gameContainer.clientWidth / 2 - ball.clientWidth / 2;
let ballY = gameContainer.clientHeight / 2 - ball.clientHeight / 2;
let ballSpeedX = initialBallSpeed;
let ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);

let score1 = 0;
let score2 = 0;
let gameStartTime = Date.now();
let gameOver = false;

paddleSliderMobile.addEventListener('input', (e) => {
    const sliderValue = e.target.value;
    const maxY = gameContainer.clientHeight - playerPaddle.clientHeight;
    const newTop = (sliderValue / 100) * maxY;
    playerPaddle.style.top = `${newTop}px`;
});

document.addEventListener('DOMContentLoaded', () => {
    gameContainer.addEventListener('mousemove', function(e) {
        const playerPaddleHeight = playerPaddle.clientHeight;
        const gameContainerHeight = gameContainer.clientHeight;
        const newTop = e.clientY - playerPaddleHeight / 2;
        playerPaddle.style.top = `${Math.max(0, Math.min(newTop, gameContainerHeight - playerPaddleHeight))}px`;
    });
});

function moveAIPaddle() {
    const aiPaddleTop = parseInt(aiPaddle.style.top) || 0;
    const ballTop = ballY - ball.clientHeight / 2;
    const distance = ballTop - (aiPaddleTop + aiPaddle.clientHeight / 2);

    if (distance > 50) {
        aiPaddle.style.top = `${Math.min(aiPaddleTop + maxAIPaddleSpeed, gameContainer.clientHeight - aiPaddle.clientHeight)}px`;
    } else if (distance < -50) {
        aiPaddle.style.top = `${Math.max(aiPaddleTop - maxAIPaddleSpeed, 0)}px`;
    }
}

function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 0) {
        ballY = 0;
        changeBallDirection(true, true);
    } else if (ballY >= gameContainer.clientHeight - ball.clientHeight) {
        ballY = gameContainer.clientHeight - ball.clientHeight;
        changeBallDirection(true, true);
    }

    if (ballX <= playerPaddle.clientWidth && ballY + ball.clientHeight >= parseInt(playerPaddle.style.top) && ballY <= parseInt(playerPaddle.style.top) + playerPaddle.clientHeight) {
        ballX = playerPaddle.clientWidth;
        ballSpeedX *= -paddleBoost;
        changeBallDirection(false, false);
    } else if (ballX >= gameContainer.clientWidth - ball.clientWidth - aiPaddle.clientWidth && ballY + ball.clientHeight >= parseInt(aiPaddle.style.top) && ballY <= parseInt(aiPaddle.style.top) + aiPaddle.clientHeight) {
        ballX = gameContainer.clientWidth - ball.clientWidth - aiPaddle.clientWidth;
        ballSpeedX *= -paddleBoost;
        changeBallDirection(false, false);
    }

    if (ballX <= 0 || ballX >= gameContainer.clientWidth - ball.clientWidth) {
        updateScore();
        resetBall();
    }

    ballSpeedX *= friction;
    ballSpeedY *= friction;

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}

function changeBallDirection(horizontal, vertical) {
    if (horizontal) {
        ballSpeedX = Math.random() * 10 + 15;
        ballSpeedX *= (Math.random() > 0.5 ? 1 : -1);
    }
    if (vertical) {
        ballSpeedY = Math.random() * 10 + 15;
        ballSpeedY *= (Math.random() > 0.5 ? 1 : -1);
    }
}

function resetBall() {
    ballX = gameContainer.clientWidth / 2 - ball.clientWidth / 2;
    ballY = gameContainer.clientHeight / 2 - ball.clientHeight / 2;
    ballSpeedX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function updateScore() {
    if (ballX <= 0) {
        score2++;
        score2Display.textContent = score2;
    } else if (ballX >= gameContainer.clientWidth - ball.clientWidth) {
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
        winnerDisplay.textContent = "L'Humain à Gagné !";
    } else if (score2 > score1) {
        winnerDisplay.textContent = "L'IA à gagnée !";
    } else {
        winnerDisplay.textContent = 'Égalité';
    }
    winnerDisplay.style.display = 'block';
}

function initializeGame() {
    playerPaddle.style.top = '37.5%';
    aiPaddle.style.top = '37.5%';
    resetBall();
}

initializeGame();
gameLoop();

document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});
