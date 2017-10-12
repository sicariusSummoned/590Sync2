let canvas;
let ctx;
let displayUserID;
let displayWaveName;
let displayHP;
let displayScore;
let userScore = 0;
let socket;

let crossHairs = {};
let enemies = {};
let mousePosition = {
  x: 0,
  y: 0
};

let myID;

const createUser = () => {
  let userID = Math.floor(Math.random() * 10000000).toString();
  myID = userID;

  let color = `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;

  crossHairs[userID] = {
    x: 0,
    y: 0,
    width: 5,
    height: 5,
    id: myID,
    color: color
  };

  socket.emit('createdUser', crossHairs[userID]);

  console.dir(crossHairs[userID]);
};

const checkForHits = () => {
  if (enemies != null && enemies != undefined) {
    let keys = Object.keys(enemies);

    console.log(`MouseX:${mousePosition.x} MouseY:${mousePosition.y}`);


    for (let i = 0; i < keys.length; i++) {
      const target = enemies[keys[i]];

      console.log(`TargetX:${target.x} TargetY:${target.y}`);

      if (mousePosition.x < target.x + target.radius && mousePosition.x > target.x - target.radius) {
        if (mousePosition.y < target.y + target.radius && mousePosition.y > target.y - target.radius) {
          console.log('hit registered');
          socket.emit('playerHitClaim', target.id);
          userScore++;
        }
      }
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawScreen = (data) => {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEnemies(data.serverEnemies);
  drawCrosshairs(data.serverCrosshairs);
  displayWaveName.innerText = data.waveName;
  console.log(data.serverHealth);
  displayHP.innerText = data.serverHealth.toString();
  displayScore.innerText = userScore.toString();
};

const drawEnemies = (data) => {
  if (data != null && data != undefined) {
    enemies = data;

    let keys = Object.keys(enemies);

    for (let i = 0; i < keys.length; i++) {
      const drawCall = enemies[keys[i]];
      ctx.fillStyle = drawCall.color;
      ctx.beginPath();
      ctx.arc(drawCall.x, drawCall.y, drawCall.radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  } else {
    console.log('Enemy data is null');
  }


};

const drawCrosshairs = (data) => {
  crossHairs = data;

  let keys = Object.keys(crossHairs);

  for (let i = 0; i < keys.length; i++) {
    const drawCall = crossHairs[keys[i]];
    ctx.fillStyle = drawCall.color;
    ctx.fillRect(drawCall.x - drawCall.width / 2, drawCall.y - drawCall.height / 2, drawCall.width, drawCall.height);
  }
};

const clientMoved = (passedPosition) => {
  crossHairs[myID].x = passedPosition.x;
  crossHairs[myID].y = passedPosition.y;


  socket.emit('clientMoved', crossHairs[myID]);
};

const getMousePosition = (canvas, evt) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

const sendUpdate = () => {
  clientMoved(mousePosition);
};

const init = () => {
  console.log("init called");
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  socket = io.connect();
  
  
  
  socket.on('connect', () => {
    createUser();
    displayUserID.innerText = myID;
  });

  socket.on('updateScreen', drawScreen);
  displayUserID = document.querySelector("#playerID");
  displayWaveName = document.querySelector("#waveName");
  displayHP = document.querySelector("#currentHP");
  displayScore = document.querySelector("#currentScore");
  
  setInterval(sendUpdate, 20);

  window.addEventListener('mousemove', function (evt) {
    mousePosition = getMousePosition(canvas, evt);
  }, false);

  window.addEventListener('click', checkForHits);
}


window.onload = init;
