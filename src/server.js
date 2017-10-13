let io;
let game = require('./game.js');

let currentWave = 0;
let runOnce = false;
let hp = game.getHealth();


let serverVariables = {
  serverCrosshairs: {},
  serverEnemies: {},
  waveName: "null",
  serverHealth: hp,
};



const sendUpdate = () => {
  io.sockets.in('room1').emit('updateScreen', serverVariables);
};

const serverUpdate = () => {
  game.update(serverVariables.serverEnemies, currentWave, 800);

  serverVariables.serverHealth = game.getHealth();

  if (game.isWaveOver(serverVariables.serverEnemies) === true) {

    currentWave++;
    serverVariables.serverEnemies = game.loadWave(currentWave).enemies;
    serverVariables.waveName = game.loadWave(currentWave).waveName;
  }


  if (serverVariables.serverHealth <= 0) {
    serverVariables.serverEnemies = game.loadWave(-1).enemies;
    serverVariables.waveName = game.loadWave(-1).waveName;
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



const configure = (ioServer) => {
  io = ioServer;


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
};

module.exports.configure = configure;
