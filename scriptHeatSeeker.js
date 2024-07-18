const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const timerDisplay = document.getElementById('timer');
const winnerDisplay = document.getElementById('winner');
const paddleSliderMobile = document.getElementById('paddle-slider-mobile');
const gameContainer = document.querySelector('.game-container');

const initialBallSpeed = 15; // Vitesse initiale de la balle
const aiReactiveness = 0.2; // Réactivité de l'IA
const maxAIPaddleSpeed = 8; // Vitesse maximale du paddle de l'IA
const gameDuration = 90; // Durée du jeu en secondes

const gravity = 0.0; // Pas de gravité
const friction = 0.98; // Faible frottement pour conserver la vitesse
const paddleBoost = 0; // Facteur de boost de vitesse quand la balle touche un paddle

let ballX = 400;
let ballY = 200;
let ballSpeedX = initialBallSpeed;
let ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1); // Direction aléatoire initiale

let score1 = 0;
let score2 = 0;
let gameStartTime = Date.now();
let gameOver = false;

// Mise à jour du paddle du joueur avec le slider sur mobile
paddleSliderMobile.addEventListener('input', (e) => {
    const sliderValue = e.target.value;
    const maxY = gameContainer.clientHeight - playerPaddle.clientHeight;
    const newTop = (sliderValue / 100) * maxY;
    playerPaddle.style.top = `${newTop}px`;
});

// Mouvement du paddle avec la souris sur ordinateur
document.addEventListener('DOMContentLoaded', () => {
    gameContainer.addEventListener('mousemove', function(e) {
        const playerPaddleHeight = playerPaddle.clientHeight;
        const gameContainerHeight = gameContainer.clientHeight;
        const newTop = e.clientY - playerPaddleHeight / 2;
        playerPaddle.style.top = `${Math.max(0, Math.min(newTop, gameContainerHeight - playerPaddleHeight))}px`;
    });
});

// Mouvement du paddle de l'IA
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

// Mouvement de la balle
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

    ballSpeedX *= friction;
    ballSpeedY *= friction;

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}

// Changer la direction de la balle de manière aléatoire
function changeBallDirection(horizontal, vertical) {
    if (horizontal) {
        ballSpeedX = Math.random() * 6 + 11; // Vitesse horizontale aléatoire entre 15 et 25
        ballSpeedX *= (Math.random() > 0.5 ? 1 : -1); // Direction aléatoire
    }
    if (vertical) {
        ballSpeedY = Math.random() * 10 + 15; // Vitesse verticale aléatoire entre 15 et 25
        ballSpeedY *= (Math.random() > 0.5 ? 1 : -1); // Direction aléatoire
    }
}

// Réinitialisation de la balle
function resetBall() {
    ballX = gameContainer.clientWidth / 2 - ball.clientWidth / 2;
    ballY = gameContainer.clientHeight / 2 - ball.clientHeight / 2;
    ballSpeedX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Mise à jour du score
function updateScore() {
    if (ballX <= 0) {
        score2++;
        score2Display.textContent = score2;
    } else if (ballX >= gameContainer.clientWidth - ball.clientWidth) {
        score1++;
        score1Display.textContent = score1;
    }
}

// Mise à jour du timer
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const timeLeft = gameDuration - elapsedTime;
    timerDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
        endGame();
    }
}

// Fonction de formatage du temps
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Boucle de jeu
function gameLoop() {
    if (gameOver) return;

    moveAIPaddle();
    moveBall();
    updateScore();

    if (score1 >= 100 || score2 >= 100) {
        endGame();
    } else {
        requestAnimationFrame(gameLoop);
    }
}
// Initialisation du jeu
function initializeGame() {
    resetBall();
    playerPaddle.style.top = `${gameContainer.clientHeight / 2 - playerPaddle.clientHeight / 2}px`;
    aiPaddle.style.top = `${gameContainer.clientHeight / 2 - aiPaddle.clientHeight / 2}px`;
    gameStartTime = Date.now(); // Réinitialiser le temps de début du jeu
}

// Fin de partie
function endGame() {
    gameOver = true;
    if (score1 > score2) {
        winnerDisplay.textContent = "L'Humain a gagné !";
    } else if (score2 > score1) {
        winnerDisplay.textContent = "L'IA a gagné !";
    } else {
        winnerDisplay.textContent = "Égalité !";
    }
    winnerDisplay.style.display = 'block';
}

// Événement de chargement du DOM pour initialiser le jeu
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    gameLoop();
});
document.addEventListener('mousemove', function(e) {
    const navbar = document.querySelector('.navbar');
    
    // Si la souris est à moins de 200 pixels du bord gauche de la fenêtre, afficher la navbar
    if (e.clientX < 200) {
        navbar.style.left = '0';
    } else {
        navbar.style.left = '-200px';
    }
});