const http = require('http');
const socketio = require('socket.io');
const game = require('./game.js');
const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

let currentWave = 0;

let runOnce = false;

const handler = (request, response) => {
  if (request.url === '/es5conversion.js') {
    fs.readFile(`${__dirname}/../hosted/es5conversion.js`, (err, data) => {
      if (err) {
        throw err;
      }
      response.writeHead(200, {
        'Content-Type': 'application/javascript',
      });

      response.write(data);
      response.end();
    });
  } else {
    fs.readFile(`${__dirname}/../hosted/index.html`, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, {
        'Content-Type': 'text/html',
      });

      response.write(data);
      response.end();
    });
  }
};

const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);


let serverVariables = {
  serverCrosshairs: {},
  serverEnemies: {},
  waveName: "null",
};

const sendUpdate = () => {
  io.sockets.in('room1').emit('updateScreen', serverVariables);
};

const serverUpdate = () => {
  game.update(serverVariables.serverEnemies, currentWave, 800);
  if (game.isWaveOver(serverVariables.serverEnemies) === true) {
    currentWave++;
    serverVariables.serverEnemies = game.loadWave(currentWave).enemies;
    serverVariables.waveName = game.loadWave(currentWave).waveName;
    
  }
  sendUpdate();
};

const onNewUser = (sock) => {
  const socket = sock;

  socket.on('createdUser', (data) => {
    socket.join('room1');
    console.log('User joined!');
    serverVariables.serverCrosshairs[data.id] = data;
    socket.id = data.id;
    console.log(`Socket.id:${socket.id}`);
    io.sockets.in('room1').emit('updateScreen', serverVariables);
    console.log(`User:${socket.id} has joined.`);
    console.dir(serverVariables.serverCrosshairs);

    if (runOnce === false) {
      setInterval(serverUpdate, 30);
      runOnce = true;
    }
  });
};

const onClientMoved = (sock) => {
  const socket = sock;

  socket.on('clientMoved', (data) => {
    serverVariables.serverCrosshairs[data.id] = data;
    io.sockets.in('room1').emit('updateScreen', serverVariables);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log(`User:${socket.id} has left.`);
    delete serverVariables.serverCrosshairs[socket.id];
    io.sockets.in('room1').emit('updateScreen', serverVariables);
    socket.leave('room1');
    console.dir(serverVariables.serverCrosshairs);
  });
};

const onHitClaim = (sock) => {
  const socket = sock;

  socket.on('playerHitClaim', (sentID) => {
    serverVariables.serverEnemies = game.checkHitClaim(serverVariables.serverEnemies, sentID);
    
    sendUpdate();
  });
};

io.on('connection', (socket) => {
  console.log('connection started');
  serverVariables.serverEnemies = game.loadWave(0).enemies;
  serverVariables.waveName = game.loadWave(0).waveName;

  onHitClaim(socket);
  onNewUser(socket);
  onClientMoved(socket);
  onDisconnect(socket);
  sendUpdate();
});

console.log(`Server opened at 127.0.0.1: ${PORT}`);
