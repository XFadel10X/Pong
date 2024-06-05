const socket = io();

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game');
const endScreen = document.getElementById('end-screen');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const winnerMessage = document.getElementById('winner-message');
const restartButton = document.getElementById('restart-button');
const fpsDisplay = document.createElement('div');

let playerName, playerColor, playerId;
let paddleY = 200, opponentPaddleY = 200;
let ballX = 300, ballY = 200, ballSpeedX = 4, ballSpeedY = 4;
let score = 0, opponentScore = 0;
let isGameRunning = false;
let lastFrameTime = 0;
let speedIncrement = 1.15;

// Ajouter l'affichage des FPS
fpsDisplay.style.position = 'absolute';
fpsDisplay.style.top = '10px';
fpsDisplay.style.right = '10px';
fpsDisplay.style.color = 'white';
fpsDisplay.style.fontSize = '16px';
gameScreen.appendChild(fpsDisplay);

// Débuter le jeu
document.getElementById('start-form').addEventListener('submit', (e) => {
    e.preventDefault();
    playerName = document.getElementById('player-name').value;
    playerColor = document.getElementById('player-color').value;
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    socket.emit('newPlayer', { name: playerName, color: playerColor });
    startCountdown(3); // Lancer le compte à rebours de 3 secondes
});

// Compte à rebours
function startCountdown(duration) {
    let countdown = duration;
    const countdownInterval = setInterval(() => {
        const countdownDisplay = document.createElement('div');
        countdownDisplay.style.position = 'absolute';
        countdownDisplay.style.top = '50%';
        countdownDisplay.style.left = '50%';
        countdownDisplay.style.transform = 'translate(-50%, -50%)';
        countdownDisplay.style.fontSize = '48px';
        countdownDisplay.style.color = 'white';
        countdownDisplay.textContent = countdown;
        gameScreen.appendChild(countdownDisplay);

        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            countdownDisplay.remove();
            startMatch(); // Démarrer le match après le compte à rebours
        }
    }, 1000);
}

// Démarrer le match
function startMatch() {
    isGameRunning = true;
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

socket.on('connect', () => {
    playerId = socket.id;
});

socket.on('updatePlayers', (players) => {
    const player = players[playerId];
    const opponent = Object.values(players).find(p => p !== player);
    if (player) {
        paddle1.style.top = player.paddleY + 'px';
        paddle1.style.backgroundColor = player.color;
        score = player.score;
    }
    if (opponent) {
        paddle2.style.top = opponent.paddleY + 'px';
        opponentPaddleY = opponent.paddleY;
        paddle2.style.backgroundColor = opponent.color;
        opponentScore = opponent.score;
    }
});

socket.on('updateBall', (ballData) => {
    ballX = ballData.x;
    ballY = ballData.y;
    ballSpeedX = ballData.speedX;
    ballSpeedY = ballData.speedY;
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
});

socket.on('updateScores', (players) => {
    score = players[playerId].score;
    const opponent = Object.values(players).find(p => p !== players[playerId]);
    opponentScore = opponent.score;
});

// Gestion des mouvements du paddle
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        paddleY -= 10;
    } else if (e.key === 'ArrowDown') {
        paddleY += 10;
    }
    if (paddleY < 0) paddleY = 0;
    if (paddleY > gameScreen.clientHeight - paddle1.clientHeight) paddleY = gameScreen.clientHeight - paddle1.clientHeight;
    paddle1.style.top = paddleY + 'px';
    socket.emit('updatePaddle', { paddleY });
});

// Gestion des mouvements du paddle pour les téléphones
gameScreen.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const touchY = touch.clientY - gameScreen.offsetTop;
    if (touchY >= 0 && touchY <= gameScreen.clientHeight) {
        paddleY = touchY - (paddle1.clientHeight / 2);
        if (paddleY < 0) paddleY = 0;
        if (paddleY > gameScreen.clientHeight - paddle1.clientHeight) paddleY = gameScreen.clientHeight - paddle1.clientHeight;
        paddle1.style.top = paddleY + 'px';
        socket.emit('updatePaddle', { paddleY });
    }
});

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    if (isGameRunning) {
        moveBall(deltaTime);
        detectCollisions();
        fpsDisplay.textContent = `FPS: ${Math.round(1 / deltaTime)}`;
        requestAnimationFrame(gameLoop);
    }
}

function moveBall(deltaTime) {
    ballX += ballSpeedX * deltaTime * 60;
    ballY += ballSpeedY * deltaTime * 60;

    if (ballY < 0 || ballY > gameScreen.clientHeight - ball.clientHeight) {
        ballSpeedY = -ballSpeedY;
        ballSpeedX *= speedIncrement; // Augmente la vitesse
        ballSpeedY *= speedIncrement; // Augmente la vitesse
    }

    if (ballX < paddle1.clientWidth + 10 && ballY > paddleY && ballY < paddleY + paddle1.clientHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= speedIncrement; // Augmente la vitesse
        ballSpeedY *= speedIncrement; // Augmente la vitesse
    } else if (ballX > gameScreen.clientWidth - paddle2.clientWidth - 20 - ball.clientWidth && ballY > opponentPaddleY && ballY < opponentPaddleY + paddle2.clientHeight) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= speedIncrement; // Augmente la vitesse
        ballSpeedY *= speedIncrement; // Augmente la vitesse
    }

    if (ballX < 0) {
        opponentScore++;
        resetBall();
    } else if (ballX > gameScreen.clientWidth - ball.clientWidth) {
        score++;
        resetBall();
    }

    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    socket.emit('updateBall', { x: ballX, y: ballY, speedX: ballSpeedX, speedY: ballSpeedY });
}

function detectCollisions() {
    // Check for paddle-ball collisions and update scores
    if (score >= 15 || opponentScore >= 15 || (!isGameRunning && currentTime - startTime >= 60000)) {
        endGame();
    }
}

function resetBall() {
    ballX = gameScreen.clientWidth / 2;
    ballY = gameScreen.clientHeight / 2;
    ballSpeedX = 4;
    ballSpeedY = 4;
}

function endGame() {
    isGameRunning = false;
    gameScreen.style.display = 'none';
    endScreen.style.display = 'flex';
    if (score > opponentScore) {
        winnerMessage.textContent = `${playerName} wins!`;
    } else {
        winnerMessage.textContent = `Opponent wins!`;
    }
}

restartButton.addEventListener('click', () => {
    window.location.reload();
});
