let io;
const game = require('./game.js');

let currentWave = 0;
let runOnce = false;
let gameOver = false;
const hp = game.getHealth();


const serverVariables = {
  serverCrosshairs: {},
  serverEnemies: {},
  waveName: 'null',
  serverHealth: hp,
};

//Sync functions update players to current gamestate, act as a way to sanity check clients with server.
const syncEnemies = () => {
  io.sockets.in('room1').emit('syncServerEnemies', serverVariables.serverEnemies);
};

const syncName = () => {
  io.sockets.in('room1').emit('syncServerName', serverVariables.waveName);
};

const syncHealth = () => {
  io.sockets.in('room1').emit('syncServerHealth', serverVariables.serverHealth);
};

//Contains level updating logic
//Server runs this to keep simulation up to date.
const serverUpdate = () => {
  game.update(serverVariables.serverEnemies, currentWave, 800);

  if (serverVariables.serverHealth !== game.getHealth) {
    serverVariables.serverHealth = game.getHealth();
    syncHealth();
  }
  

  if (game.isWaveOver(serverVariables.serverEnemies) === true) {
    if(currentWave <9){
          currentWave++;

    }else{
      currentWave = 0;
    }
    serverVariables.serverEnemies = game.loadWave(currentWave).enemies;
    serverVariables.waveName = game.loadWave(currentWave).waveName;
    syncHealth();
    syncName();
    syncEnemies();
  }
  if (serverVariables.serverHealth <= 0 && gameOver === false) {
    serverVariables.serverEnemies = game.loadWave(-1).enemies;
    serverVariables.waveName = game.loadWave(-1).waveName;
    syncName();
    syncEnemies();
    gameOver = true;
  }
};

//If you're the first user, remember to launch everything.
const onNewUser = (sock) => {
  const socket = sock;

  socket.on('createdUser', (data) => {
    socket.join('room1');
    console.log('User joined!');
    serverVariables.serverCrosshairs[data.id] = data;
    socket.id = data.id;
    console.log(`Socket.id:${socket.id}`);
    io.sockets.in('room1').emit('updateCrosshairs', serverVariables.serverCrosshairs);
    console.log(`User:${socket.id} has joined.`);
    console.dir(serverVariables.serverCrosshairs);

    if (runOnce === false) {
      serverVariables.serverEnemies = game.loadWave(0).enemies;
      serverVariables.waveName = game.loadWave(0).waveName;
      setInterval(serverUpdate, 20);
      setInterval(syncEnemies, 100);
      runOnce = true;
    }
    syncEnemies();
    syncHealth();
    syncName();
  });
};

//We are constantly sending and receiving mouse movements, but that's only x y and id so it should be pretty light.
const onClientMoved = (sock) => {
  const socket = sock;

  socket.on('clientMoved', (data) => {
    serverVariables.serverCrosshairs[data.id] = data;
    io.sockets.in('room1').emit('updateCrosshairs', serverVariables.serverCrosshairs);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    console.log(`User:${socket.id} has left.`);
    delete serverVariables.serverCrosshairs[socket.id];
    io.sockets.in('room1').emit('updateCrosshairs', serverVariables.serverCrosshairs);
    socket.leave('room1');
  });
};

//Manages multiple players hitting same object without causing bad indexes
const onHitClaim = (sock) => {
  const socket = sock;

  socket.on('playerHitClaim', (sentID) => {
    serverVariables.serverEnemies = game.checkHitClaim(serverVariables.serverEnemies, sentID);
    syncEnemies();
  });
};


const configure = (ioServer) => {
  io = ioServer;


  io.on('connection', (socket) => {
    console.log('connection started');

    onHitClaim(socket);
    onNewUser(socket);
    onClientMoved(socket);
    onDisconnect(socket);
    syncEnemies();
    syncHealth();
    syncName();
  });
};

module.exports.configure = configure;
