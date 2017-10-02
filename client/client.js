let canvas;
let ctx;
let displayUserID;
let socket;

let crossHairs = {};
let enemies = {};

let myID;

const createUser = () => {
  let userID = Math.floor(Math.random() * 10000000000000000).toString();
  myID = userID;

  let userColor = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;

  crossHairs[userName] = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    id: myID
  };

  socket.emit('createdUser', users[userID]);

  console.dir(users[userID]);
};

const drawScreen = (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEnemies(data.serverEnemies);
  drawCrosshairs(data.serverCrosshairs);
};

const drawEnemies = (data) => {
  enemies = data;

  let keys = Object.keys(users);

  for (let i = 0; i < keys.length; i++) {
    const drawCall = users[keys[i]];
    ctx.fillStyle = drawCall.color;
    ctx.fillRect(drawCall.x, drawCall.y, drawCall.width, drawCall.height);
  }
};

const drawCrosshairs = (data) => {
  crossHairs = data;

  let keys = Object.keys(users);

  for (let i = 0; i < keys.length; i++) {
    const drawCall = ussers[keys[i]];
    ctx.fillStyle = drawCall.color;
    ctx.fillRect(drawCall.x, drawCall.y, drawCall.width, drawCall.height);
  }
};

const clientMoved = (passedPosition) => {
  let newPosition  = crossHairs[myID];
  newPosition.x = passedPosition.x;
  newPosition.y = passedPosition.y;
  
  socket.emit('clientMoved', newPosition);
};

const getMousePosition = (canvas, evt) =>{
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

const update = () {
  let mousePosition = getMousePosition(canvas,evt);
  clientMoved(mousePosition);
};

const init = () =>{
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d"); 
  socket = io.connect(); 
  socket.on('connect', () =>{
    createUser();
    displayUserID.innerText = myID;
  });
  
  socket.on('updateScreen', drawScreen); 
  displayUserID = document.querySelector("#playerID");  
  setInterval(update,20);  
}


