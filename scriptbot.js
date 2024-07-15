
const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const timerDisplay = document.getElementById('timer');
const winnerDisplay = document.getElementById('winner');



const ballSpeedX = 6.5; 
const ballSpeedY = 6.5;
const aiReactiveness = 0.3; 
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


function movePlayerPaddle(e) {
    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newTop = clientY - playerPaddle.clientHeight / 2;
    playerPaddle.style.top = `${Math.max(0, Math.min(newTop, 400 - playerPaddle.clientHeight))}px`;
}


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
        winnerDisplay.textContent = 'Humain à Gagnée!';
    } else if (score2 > score1) {
        winnerDisplay.textContent = 'IA à gagnée';
    } else {
        winnerDisplay.textContent = 'égalitée';
    }
    winnerDisplay.style.display = 'block';
}


function initEventListeners() {
    document.addEventListener('mousemove', movePlayerPaddle);
    document.addEventListener('touchstart', movePlayerPaddle);
    document.addEventListener('touchmove', movePlayerPaddle);
    aiPaddle.addEventListener('click', () => {
        window.location.href = 'https://chat-jai-pete.fr/';
    });
}


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
