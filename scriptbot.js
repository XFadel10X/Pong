const paddleSpeed = 5;
const ballSpeedX = 5;
const ballSpeedY = 5;

const playerPaddle = document.getElementById('player');
const aiPaddle = document.getElementById('ai');
const ball = document.querySelector('.ball');

let ballX = 400;
let ballY = 200;
let ballDirectionX = 1;
let ballDirectionY = 1;

function movePlayerPaddle(e) {
    playerPaddle.style.top = `${e.clientY - playerPaddle.clientHeight / 2}px`;
}

function moveAIPaddle() {
    const aiPaddleTop = parseInt(aiPaddle.style.top) || 0;
    const ballTop = ballY - ball.clientHeight / 2;

    if (aiPaddleTop + aiPaddle.clientHeight / 2 < ballTop) {
        aiPaddle.style.top = `${aiPaddleTop + paddleSpeed}px`;
    } else if (aiPaddleTop + aiPaddle.clientHeight / 2 > ballTop) {
        aiPaddle.style.top = `${aiPaddleTop - paddleSpeed}px`;
    }
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
        resetBall();
    }

    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}

function resetBall() {
    ballX = 400;
    ballY = 200;
}

function gameLoop() {
    moveAIPaddle();
    moveBall();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('mousemove', movePlayerPaddle);
gameLoop();
