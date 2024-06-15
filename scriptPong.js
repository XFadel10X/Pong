// Déclaration des variables
let paddle1Y, paddle2Y;
let ballX, ballY;
let ballSpeedX, ballSpeedY;
let score1, score2;
let gameInterval, timerInterval;
let remainingTime;
let player1Name, player2Name;
let fps, lastFrameTime;
const gameDuration = 60; // Durée du jeu en secondes
const paddleSpeed = 3;
const speedIncrement = 1.05; // Facteur d'augmentation de la vitesse de la balle
let paddle1Direction = 0;
let paddle2Direction = 0;

// Sélection des éléments HTML
const startForm = document.getElementById('start-form');
const player1NameInput = document.getElementById('player1-name');
const player1ColorInput = document.getElementById('player1-color');
const player2NameInput = document.getElementById('player2-name');
const player2ColorInput = document.getElementById('player2-color');

const startScreen = document.getElementById('start-screen');
const pongGame = document.getElementById('pong-game');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const score1Display = document.getElementById('score1');
const score2Display = document.getElementById('score2');
const player1DisplayName = document.getElementById('player1-display-name');
const player2DisplayName = document.getElementById('player2-display-name');
const timerDisplay = document.getElementById('timer');
const countdownDisplay = document.getElementById('countdown');
const fpsDisplay = document.getElementById('fps-display');

const endScreen = document.getElementById('end-screen');
const winnerMessage = document.getElementById('winner-message');
const restartButton = document.getElementById('restart-button');

// Chargement des sons

// Gestionnaire d'événement pour démarrer le jeu
startForm.addEventListener('submit', startGame);

// Gestionnaire d'événement pour redémarrer le jeu
restartButton.addEventListener('click', restartGame);

// Gestionnaire d'événement pour les touches du clavier
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Gestionnaire d'événement pour les contrôles tactiles
// Gestionnaire d'événement pour les contrôles tactiles
// Gestionnaire d'événement pour les contrôles tactiles

// Fonction pour détecter les touches enfoncées
function keyDownHandler(e) {
    if (e.key === 'z') {
        paddle1Direction = -paddleSpeed; // Haut
    } else if (e.key === 's') {
        paddle1Direction = paddleSpeed; // Bas
    } else if (e.key === 'ArrowUp') {
        paddle2Direction = -paddleSpeed; // Haut
    } else if (e.key === 'ArrowDown') {
        paddle2Direction = paddleSpeed; // Bas
    }
}

// Fonction pour détecter les touches relâchées
function keyUpHandler(e) {
    if (e.key === 'z' || e.key === 's') {
        paddle1Direction = 0; // Arrêt
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        paddle2Direction = 0; // Arrêt
    }
}
// Fonction pour mettre à jour la position des paddles
function movePaddles() {
    paddle1Y += paddle1Direction;
    paddle2Y += paddle2Direction;

    // Empêcher les paddles de sortir de l'écran
    if (paddle1Y < 0) {
        paddle1Y = 0;
    } else if (paddle1Y > pongGame.clientHeight - paddle1.clientHeight) {
        paddle1Y = pongGame.clientHeight - paddle1.clientHeight;
    }

    if (paddle2Y < 0) {
        paddle2Y = 0;
    } else if (paddle2Y > pongGame.clientHeight - paddle2.clientHeight) {
        paddle2Y = pongGame.clientHeight - paddle2.clientHeight;
    }

    paddle1.style.top = paddle1Y + 'px';
    paddle2.style.top = paddle2Y + 'px';
}

// Fonction pour déplacer la balle
function moveBall(deltaTime) {
    ballX += ballSpeedX * deltaTime * 60;
    ballY += ballSpeedY * deltaTime * 60;

    // Détection des collisions avec les murs supérieur et inférieur
    if (ballY < 0 || ballY > pongGame.clientHeight - ball.clientHeight) {
        ballSpeedY = -ballSpeedY;
    }

    // Détection des collisions avec les paddles
    if (ballX < paddle1.clientWidth + 20 && ballY > paddle1Y && ballY < paddle1Y + paddle1.clientHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= speedIncrement; // Augmente la vitesse
        ballSpeedY *= speedIncrement; // Augmente la vitesse
        hitSound.play();
    } else if (ballX > pongGame.clientWidth - paddle2.clientWidth - 20 - ball.clientWidth && ballY > paddle2Y && ballY < paddle2Y + paddle2.clientHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= speedIncrement; // Augmente la vitesse
        ballSpeedY *= speedIncrement; // Augmente la vitesse
        hitSound.play();
    }

    // Détection des scores
    if (ballX < 0) {
        score2++;
        resetBall();
    } else if (ballX > pongGame.clientWidth - ball.clientWidth) {
        score1++;
        resetBall();
    }

    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    score1Display.textContent = score1;
    score2Display.textContent = score2;
}
// Fonction pour démarrer le jeu
function startGame(e) {
    e.preventDefault();
    player1Name = player1NameInput.value;
    player2Name = player2NameInput.value;
    player1DisplayName.textContent = player1Name;
    player2DisplayName.textContent = player2Name;
    paddle1.style.backgroundColor = player1ColorInput.value;
    paddle2.style.backgroundColor = player2ColorInput.value;
    startScreen.style.display = 'none';
    pongGame.style.display = 'block';
    countdownDisplay.style.display = 'block';
    startCountdown(3); // Début du compte à rebours de 3 secondes
}

// Fonction pour démarrer le compte à rebours
function startCountdown(duration) {
    let countdown = duration;
    const countdownInterval = setInterval(() => {
        countdownDisplay.textContent = countdown;
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            countdownDisplay.style.display = 'none';
            startMatch(); // Commence le match après le compte à rebours
        }
    }, 1000);
}

// Fonction pour démarrer le match
function startMatch() {
    paddle1Y = paddle2Y = (pongGame.clientHeight - paddle1.clientHeight) / 2;
    ballX = pongGame.clientWidth / 2;
    ballY = pongGame.clientHeight / 2;
    ballSpeedX = 4;
    ballSpeedY = 4;
    score1 = score2 = 0;
    score1Display.textContent = score1;
    score2Display.textContent = score2;
    remainingTime = gameDuration;
    timerDisplay.textContent = `Temps restant: ${remainingTime}s`;
    lastFrameTime = performance.now();
    gameInterval = setInterval(gameLoop, 1000 / 144); // Rendu à 144 FPS
    timerInterval = setInterval(updateTimer, 1000);
}

// Fonction pour mettre à jour le minuteur
function updateTimer() {
    remainingTime--;
    timerDisplay.textContent = `Temps restant: ${remainingTime}s`;
    if (remainingTime <= 0) {
        endMatch();
    }
}

// Fonction pour mettre fin au match
function endMatch() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    pongGame.style.display = 'none';
    endScreen.style.display = 'flex';
    if (score1 > score2) {
        winnerMessage.textContent = `${player1Name} a gagné !`;
    } else if (score2 > score1) {
        winnerMessage.textContent = `${player2Name} a gagné !`;
    } else {
        winnerMessage.textContent = "Match nul !";
    }
}

// Fonction pour redémarrer le jeu
function restartGame() {
    endScreen.style.display = 'none';
    startScreen.style.display = 'flex';
}

// Fonction pour mettre à jour le jeu à chaque frame
function gameLoop() {
    let deltaTime = (performance.now() - lastFrameTime) / 1000;
    lastFrameTime = performance.now();

    movePaddles();
    moveBall(deltaTime);
    detectCollisions();
    updateFps(deltaTime);
}

// Fonction pour détecter les collisions de la balle
function detectCollisions() {
    // Ajouter la logique de détection des collisions
}

// Fonction pour réinitialiser la balle
function resetBall() {
    ballX = pongGame.clientWidth / 2;
    ballY = pongGame.clientHeight / 2;
    ballSpeedX = Math.sign(ballSpeedX) * 4; // Réinitialise la vitesse de la balle
    ballSpeedY = (Math.random() - 0.5) * 8; // Réinitialise la vitesse de la balle
}

// Fonction pour mettre à jour l'affichage des FPS
function updateFps(deltaTime) {
    fps = 1 / deltaTime;
    fpsDisplay.textContent = `FPS: ${Math.round(fps)}`;
}
function disableScrollDown() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            window.scrollTo(0, 0); // Remettre le scroll en haut
        }
    });
}

// Appeler la fonction de désactivation du scroll
disableScrollDown();
