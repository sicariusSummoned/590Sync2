let canvas;
let ctx;
let displayUserID;
let displayWaveName;
let displayHP;
let displayScore;

let userScore = 0;
let socket;

let crossHairImg;
let enemyImg;
let bgImg;

const numFrames = 4;
let frameIndex = 0;
let tickCount = 0;
let ticksPerFrame = 10;

console.dir(crossHairImg);

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



  crossHairs[userID] = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    id: myID,
  };

  socket.emit('createdUser', crossHairs[userID]);

  console.dir(crossHairs[userID]);
};

//Trusting the client on hitting logic, send the hit zombie's id to server to check this. Score is mostly superficial.
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
          displayScore.innerText = userScore.toString();

        }
      }
    }
  }
};
//Client side update to keep weight off of the server.
const updateClient = () => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  
  tickCount++;
  if(tickCount> ticksPerFrame){
    tickCount = 0;
    if(frameIndex < numFrames -1){
      frameIndex++;
    }else{
      frameIndex = 0;
    }
  }
  
  updateEnemies();
  drawEnemies();
  drawCrosshairs();
  
};

const updateEnemies = () => {
  if (enemies != null && enemies != undefined) {
    let keys = Object.keys(enemies);
    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      enemy.y += enemy.speed;      
    }
  }
};

//Allows zombies to animate client side. They all move lock step because I don't want to add more properties to each zombie on client side that will be lost when they get refreshed by the server.
const drawEnemies = () => {
  if (enemies != null && enemies != undefined) {
    let keys = Object.keys(enemies);
    for (let i = 0; i < keys.length; i++) {
      const drawCall = enemies[keys[i]];
      ctx.drawImage(enemyImg, frameIndex*64,0,64, 64, drawCall.x - drawCall.radius, drawCall.y - drawCall.radius, drawCall.radius*2, drawCall.radius*2);
    }
  }
};

//Other players show up as /greenish/
//You show up as red
const drawCrosshairs = () => {

  let keys = Object.keys(crossHairs);

  for (let i = 0; i < keys.length; i++) {
    const drawCall = crossHairs[keys[i]];

    ctx.save();
    if (drawCall.id === myID) {
      ctx.filter = 'none';
    } else {
      ctx.filter = 'hue-rotate(180deg)';
    }
    

    ctx.drawImage(crossHairImg, drawCall.x - drawCall.width / 2, drawCall.y - drawCall.height / 2, drawCall.width, drawCall.height);
    
    ctx.restore();
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

const syncEnemies = (data) => {
  console.log('syncing enemies');
  enemies = data;
};

const syncName = (data) => {
  console.log('syncing name');

  displayWaveName.innerText = data;
};

const syncHealth = (data) => {
  console.log('syncing health');

  displayHP.innerText = data.toString();
};

const updateCrosshairs = (data) => {
  crossHairs = data;
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

  socket.on('syncServerEnemies', syncEnemies);
  socket.on('syncServerHealth', syncHealth);
  socket.on('syncServerName', syncName);
  socket.on('updateCrosshairs', updateCrosshairs);
  displayUserID = document.querySelector("#playerID");
  displayWaveName = document.querySelector("#waveName");
  displayHP = document.querySelector("#currentHP");
  displayScore = document.querySelector("#currentScore");
  crossHairImg = document.querySelector("#crosshair");
  enemyImg = document.querySelector("#zombie");
  bgImg = document.querySelector("#bg");

  
  setInterval(updateClient, 20);


  window.addEventListener('mousemove', function (evt) {
    mousePosition = getMousePosition(canvas, evt);
    sendUpdate();
  }, false);

  window.addEventListener('click', checkForHits);
}


window.onload = init;
