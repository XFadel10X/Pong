const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

let players = {};

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });

  socket.on('newPlayer', (player) => {
    players[socket.id] = player;
    io.emit('updatePlayers', players);
  });

  socket.on('updatePaddle', (data) => {
    if (players[socket.id]) {
      players[socket.id].paddleY = data.paddleY;
      io.emit('updatePlayers', players);
    }
  });

  socket.on('updateBall', (ball) => {
    io.emit('updateBall', ball);
  });

  socket.on('score', (data) => {
    io.emit('score', data);
  });
});

app.use(express.static('public'));

server.listen(port, () => console.log(`Listening on port ${port}`));
// Fonction pour mettre à jour la position des paddles
socket.on('updatePaddle', (data) => {
    if (players[socket.id]) {
        players[socket.id].paddleY = data.paddleY;
        io.emit('updatePlayers', players);
    }
});

// Fonction pour mettre à jour la position de la balle
socket.on('updateBall', (ball) => {
    io.emit('updateBall', ball);
});

// Fonction pour mettre à jour les scores
socket.on('score', (data) => {
    io.emit('score', data);
});

