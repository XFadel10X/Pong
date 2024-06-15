// Sélection des éléments HTML
const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const timerDisplay = document.getElementById('timer');
const winnerDisplay = document.getElementById('winner');

// Variables de configuration
const paddleSpeed = 10; // Vitesse des raquettes
const ballSpeedX = 8; // Vitesse horizontale de la balle
const ballSpeedY = 8; // Vitesse verticale de la balle
const aiReactiveness = 0.2; // Réactivité de l'IA (plus faible pour des mouvements plus humains)
const maxAIPaddleSpeed = 6; // Vitesse maximale de déplacement de l'IA
const gameDuration = 90; // Durée du jeu en secondes

// Variables de jeu
let ballX = 400;
let ballY = 200;
let ballDirectionX = Math.random() < 0.5 ? 1 : -1;
let ballDirectionY = Math.random() < 0.5 ? 1 : -1;
let score1 = 0;
let score2 = 0;
let gameStartTime = Date.now();
let gameOver = false;

// Fonction pour déplacer la raquette du joueur en fonction de la souris ou du toucher
function movePlayerPaddle(e) {
    e.preventDefault(); // Empêche le défilement par défaut sur mobile
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newTop = clientY - playerPaddle.clientHeight / 2;
    playerPaddle.style.top = `${Math.max(0, Math.min(newTop, 400 - playerPaddle.clientHeight))}px`;
}

// Fonction pour déplacer la raquette de l'IA de manière plus humaine
function moveAIPaddle() {
    const aiPaddleTop = parseInt(aiPaddle.style.top) || 0;
    const ballTop = ballY - ball.clientHeight / 2;
    const distance = ballTop - (aiPaddleTop + aiPaddle.clientHeight / 2);

    // Déplacement de l'IA avec une réactivité et une vitesse maximale
    const moveAmount = aiReactiveness * distance;
    aiPaddle.style.top = `${aiPaddleTop + Math.sign(moveAmount) * Math.min(maxAIPaddleSpeed, Math.abs(moveAmount))}px`;
}

// Fonction pour déplacer la balle et gérer les collisions
function moveBall() {
    ballX += ballSpeedX * ballDirectionX;
    ballY += ballSpeedY * ballDirectionY;

    // Gestion des rebonds en haut et en bas
    if (ballY >= 380 || ballY <= 0) {
        ballDirectionY *= -1;
    }

    // Gestion des rebonds sur les raquettes
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

// Fonction pour réinitialiser la position de la balle
function resetBall() {
    ballX = 400;
    ballY = 200;
    ballDirectionX = Math.random() < 0.5 ? 1 : -1; // Direction X aléatoire
    ballDirectionY = Math.random() < 0.5 ? 1 : -1; // Direction Y aléatoire
}

// Fonction pour mettre à jour le score
function updateScore() {
    if (ballX <= 0) {
        score2++;
        score2Display.textContent = score2;
    } else if (ballX >= 780) {
        score1++;
        score1Display.textContent = score1;
    }
}

// Fonction pour gérer la logique de jeu à chaque frame
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

// Fonction pour formater le temps en minutes et secondes
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Fonction pour terminer le jeu
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

// Fonction pour initialiser les écouteurs d'événements
function initEventListeners() {
    document.addEventListener('mousemove', movePlayerPaddle);
    document.addEventListener('touchstart', movePlayerPaddle);
    document.addEventListener('touchmove', movePlayerPaddle);
    aiPaddle.addEventListener('click', () => {
        window.location.href = 'https://chat-jai-pete.fr/'; // Remplacer par le lien du live
    });
}

// Démarrage de la boucle de jeu et initialisation des écouteurs d'événements
initEventListeners();
gameLoop();
