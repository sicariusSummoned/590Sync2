'use strict';

var canvas = void 0;
var ctx = void 0;
var displayUserID = void 0;
var displayWaveName = void 0;
var displayHP = void 0;
var displayScore = void 0;

var userScore = 0;
var socket = void 0;

var crossHairImg = void 0;
var enemyImg = void 0;
var bgImg = void 0;

var numFrames = 4;
var frameIndex = 0;
var tickCount = 0;
var ticksPerFrame = 10;

console.dir(crossHairImg);

var crossHairs = {};
var enemies = {};
var mousePosition = {
  x: 0,
  y: 0
};

var myID = void 0;

var createUser = function createUser() {
  var userID = Math.floor(Math.random() * 10000000).toString();
  myID = userID;

  crossHairs[userID] = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    id: myID
  };

  socket.emit('createdUser', crossHairs[userID]);

  console.dir(crossHairs[userID]);
};

var checkForHits = function checkForHits() {
  if (enemies != null && enemies != undefined) {
    var keys = Object.keys(enemies);

    console.log('MouseX:' + mousePosition.x + ' MouseY:' + mousePosition.y);

    for (var i = 0; i < keys.length; i++) {
      var target = enemies[keys[i]];

      console.log('TargetX:' + target.x + ' TargetY:' + target.y);

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

var updateClient = function updateClient() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  tickCount++;
  if (tickCount > ticksPerFrame) {
    tickCount = 0;
    if (frameIndex < numFrames - 1) {
      frameIndex++;
    } else {
      frameIndex = 0;
    }
  }

  updateEnemies();
  drawEnemies();
  drawCrosshairs();
};

var updateEnemies = function updateEnemies() {
  if (enemies != null && enemies != undefined) {
    var keys = Object.keys(enemies);
    for (var i = 0; i < keys.length; i++) {
      var enemy = enemies[keys[i]];
      enemy.y += enemy.speed;
    }
  }
};

var drawEnemies = function drawEnemies() {
  if (enemies != null && enemies != undefined) {
    var keys = Object.keys(enemies);
    for (var i = 0; i < keys.length; i++) {
      var drawCall = enemies[keys[i]];
      ctx.drawImage(enemyImg, frameIndex * 64, 0, 64, 64, drawCall.x - drawCall.radius, drawCall.y - drawCall.radius, drawCall.radius * 2, drawCall.radius * 2);
    }
  }
};

var drawCrosshairs = function drawCrosshairs() {

  var keys = Object.keys(crossHairs);

  for (var i = 0; i < keys.length; i++) {
    var drawCall = crossHairs[keys[i]];

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

var clientMoved = function clientMoved(passedPosition) {
  crossHairs[myID].x = passedPosition.x;
  crossHairs[myID].y = passedPosition.y;

  socket.emit('clientMoved', crossHairs[myID]);
};

var getMousePosition = function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
};

var sendUpdate = function sendUpdate() {
  clientMoved(mousePosition);
};

var syncEnemies = function syncEnemies(data) {
  console.log('syncing enemies');
  enemies = data;
};

var syncName = function syncName(data) {
  console.log('syncing name');

  displayWaveName.innerText = data;
};

var syncHealth = function syncHealth(data) {
  console.log('syncing health');

  displayHP.innerText = data.toString();
};

var updateCrosshairs = function updateCrosshairs(data) {
  crossHairs = data;
};

var init = function init() {
  console.log("init called");
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  socket = io.connect();

  socket.on('connect', function () {
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
};

window.onload = init;
