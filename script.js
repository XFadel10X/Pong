// script.js
const startScreen = document.getElementById("start-screen");
const startForm = document.getElementById("start-form");
const player1NameInput = document.getElementById("player1-name");
const player1ColorInput = document.getElementById("player1-color");
const player2NameInput = document.getElementById("player2-name");
const player2ColorInput = document.getElementById("player2-color");

const pongGame = document.getElementById("pong-game");
const paddle1 = document.getElementById("paddle1");
const paddle2 = document.getElementById("paddle2");
const ball = document.getElementById("ball");
const score1Display = document.getElementById("score1");
const score2Display = document.getElementById("score2");
const player1DisplayName = document.getElementById("player1-display-name");
const player2DisplayName = document.getElementById("player2-display-name");
const timerDisplay = document.getElementById("timer");

const endScreen = document.getElementById("end-screen");
const winnerMessage = document.getElementById("winner-message");
const restartButton = document.getElementById("restart-button");
const speedIncrement = 0.5;
let paddle1Y = 150;
let paddle2Y = 150;
let paddleSpeed = 15;

let ballX = 390;
let ballY = 190;
let ballSpeedX = 5;
let ballSpeedY = 5;

let score1 = 0;
let score2 = 0;

let minutes = 0;
let seconds = 0;
let gameInterval;
let timerInterval;

let player1Name;
let player2Name;

let lastFrameTime = 0;
let fps = 0;

startForm.addEventListener("submit", startGame);
restartButton.addEventListener("click", restartGame);

function startGame(e) {
  e.preventDefault();
  player1Name = player1NameInput.value;
  player2Name = player2NameInput.value;
  player1DisplayName.textContent = player1Name;
  player2DisplayName.textContent = player2Name;
  paddle1.style.backgroundColor = player1ColorInput.value;
  paddle2.style.backgroundColor = player2ColorInput.value;
  startScreen.style.display = "none";
  pongGame.style.display = "block";
  startTimer();
  gameLoop();
}

function movePaddle(e) {
  if (e.key === "ArrowUp") {
    paddle2Y = Math.max(paddle2Y - paddleSpeed, 0);
  } else if (e.key === "ArrowDown") {
    paddle2Y = Math.min(
      paddle2Y + paddleSpeed,
      pongGame.clientHeight - paddle2.clientHeight
    );
  }

  if (e.key === "z") {
    paddle1Y = Math.max(paddle1Y - paddleSpeed, 0);
  } else if (e.key === "s") {
    paddle1Y = Math.min(
      paddle1Y + paddleSpeed,
      pongGame.clientHeight - paddle1.clientHeight
    );
  }

  paddle1.style.top = paddle1Y + "px";
  paddle2.style.top = paddle2Y + "px";
}

document.addEventListener("keydown", movePaddle);

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY >= pongGame.clientHeight - ball.clientHeight) {
    ballSpeedY = -ballSpeedY;
  }

  if (ballX <= paddle1.clientWidth) {
    if (
      ballY + ball.clientHeight >= paddle1Y &&
      ballY <= paddle1Y + paddle1.clientHeight
    ) {
      ballSpeedX = -ballSpeedX;
      increaseBallSpeed();
    } else {
      score2++;
      updateScore();
      resetBall();
    }
  }

  if (ballX + ball.clientWidth >= pongGame.clientWidth - paddle2.clientWidth) {
    if (
      ballY + ball.clientHeight >= paddle2Y &&
      ballY <= paddle2Y + paddle2.clientHeight
    ) {
      ballSpeedX = -ballSpeedX;
      increaseBallSpeed();
    } else {
      score1++;
      updateScore();
      resetBall();
    }
  }

  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
}

function increaseBallSpeed() {
  if (ballSpeedX > 0) {
    ballSpeedX += speedIncrement;
  } else {
    ballSpeedX -= speedIncrement;
  }

  if (ballSpeedY > 0) {
    ballSpeedY += speedIncrement;
  } else {
    ballSpeedY -= speedIncrement;
  }
}

function resetBall() {
  ballX = pongGame.clientWidth / 2 - ball.clientWidth / 2;
  ballY = pongGame.clientHeight / 2 - ball.clientHeight / 2;
  ballSpeedX = ballSpeedX > 0 ? -5 : 5;
  ballSpeedY = ballSpeedY > 0 ? 5 : -5;
}

function updateScore() {
  score1Display.textContent = score1;
  score2Display.textContent = score2;
}

function updateTimer() {
  seconds++;
  if (seconds >= 60) {
    clearInterval(timerInterval);
    clearInterval(gameInterval);
    endGame();
  }
  timerDisplay.textContent = `${
    Math.floor(seconds / 60) < 10 ? "0" : ""
  }${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" : ""}${seconds % 60}`;
}

function startTimer() {
  timerInterval = setInterval(updateTimer, 1000);
}

function endGame() {
  pongGame.style.display = "none";
  endScreen.style.display = "block";
  if (score1 > score2) {
    winnerMessage.textContent = `${player1Name} a gagné avec ${score1} points!`;
  } else if (score2 > score1) {
    winnerMessage.textContent = `${player2Name} a gagné avec ${score2} points!`;
  } else {
    winnerMessage.textContent = "Match nul!";
  }
}

function restartGame() {
  score1 = 0;
  score2 = 0;
  minutes = 0;
  seconds = 0;
  score1Display.textContent = score1;
  score2Display.textContent = score2;
  timerDisplay.textContent = "00:00";
  endScreen.style.display = "none";
  startScreen.style.display = "block";
}

function gameLoop() {
  moveBall();
  gameInterval = requestAnimationFrame(gameLoop);
}
function checkCollision() {
  const deltaTime = (currentTime - lastFrameTime) / 1000; // Temps écoulé depuis la dernière frame en secondes
  lastFrameTime = currentTime;

  movePaddles();
  moveBall();
  checkCollision();
  requestAnimationFrame(gameLoop);

  // Calcul du FPS
  fps = 1 / deltaTime;

  // Affichage du FPS
  fpsDisplay.textContent = `FPS: ${Math.round(fps)}`;
}
