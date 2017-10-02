const http = require('http');
const socketio = require('socket.io');

const fs = require('fs');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const handler = (request, response) => {
  fs.readFile(`${__dirname}/../hosted/index.html`, (err, data) => {
    if (err) {
      throw err;
    }

    response.writeHead(200);
    response.write(data);
    response.end();
  });
};

const app = http.createServer(handler);
const io = socketio(app);

app.listen(PORT);

const serverVariables = {
  serverCrosshairs: {},
  serverEnemies: {}
};

const onNewUser = (sock) => {
  const socket = sock;

  socket.on('createdUser', (data) =>{
    socket.join('room1');
    console.log('User joined!');
    serverVariables.serverCrosshairs[data.id] = data;
    socket.id = data.id;
    io.sockets.in('room1').emit('updateScreen', serverVariables);
    console.log(`User${data.id} has joined.`);
    console.dir(serverVariables.serverCrosshairs);
  });
};

const onClientMoved = (sock) =>{
  const socket = sock;
  
  socket.on('clientMoved', (data)=>{
    serverVariables.serverCrosshairs[data.id] = data;
    io.sockets.in('room1').emit('updateScreen', serverVariables);
  });
};

const onDisconnect = (sock) =>{
  const socket = sock;
  
  socket.on('disconnect', () =>{
    delete serverVariables.serverCrosshairs[socket.id];
    io.sockets.in('room1').emit('updateScreen', serverVariables);
  })
}



io.on('connection', (socket) => {
  console.log('connection started');
  onNewUser(socket);
  onClientMoved(socket);
  onDisconnect(socket);

});

console.log(`Server opened at 127.0.0.1: ${PORT}`);