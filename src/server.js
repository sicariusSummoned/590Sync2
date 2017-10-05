const http = require('http');
const socketio = require('socket.io');
const game = require('./game.js');
const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const currentWave = 0;

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

const serverVariables = {
  serverCrosshairs: {},
  serverEnemies: {},
};

const sendUpdate = () => {
  // const socket = sock;
  io.sockets.in('room1').emit('updateScreen', serverVariables);
};

const serverUpdate = () => {
  serverVariables.serverEnemies = game.update(serverVariables, currentWave);
  console.log('update called');
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
    console.log(`Server Enemies:${serverVariables.serverEnemies}`);
    console.dir(serverVariables.serverEnemies);

    if (io.sockets.length === 1) {
      setInterval(serverUpdate(), 500);
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


io.on('connection', (socket) => {
  console.log('connection started');
  serverVariables.serverEnemies = game.loadWave(0);

  onNewUser(socket);
  onClientMoved(socket);
  onDisconnect(socket);
  sendUpdate();
});

console.log(`Server opened at 127.0.0.1: ${PORT}`);
