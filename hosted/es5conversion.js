'use strict';

var canvas = void 0;
var ctx = void 0;
var displayUserID = void 0;
var socket = void 0;

var crossHairs = {};
var enemies = {};
var mousePosition = {
  x: 0,
  y: 0
};

var myID = void 0;

var createUser = function createUser() {
  var userID = Math.floor(Math.random() * 10000000000000000).toString();
  myID = userID;

  var color = 'rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')';

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

var drawScreen = function drawScreen(data) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEnemies(data.serverEnemies);
  drawCrosshairs(data.serverCrosshairs);
};

var drawEnemies = function drawEnemies(data) {
  console.dir(data);
  enemies = data;

  var keys = Object.keys(enemies);

  for (var i = 0; i < keys.length; i++) {
    var drawCall = enemies[keys[i]];
    ctx.fillStyle = drawCall.color;
    ctx.beginPath();
    ctx.arc(drawCall.x, drawCall.y, drawCall.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
};

var drawCrosshairs = function drawCrosshairs(data) {
  crossHairs = data;

  var keys = Object.keys(crossHairs);

  for (var i = 0; i < keys.length; i++) {
    var drawCall = crossHairs[keys[i]];
    ctx.fillStyle = drawCall.color;
    ctx.fillRect(drawCall.x - drawCall.width / 2, drawCall.y - drawCall.height / 2, drawCall.width, drawCall.height);
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

var init = function init() {
  console.log("init called");
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  socket = io.connect();
  socket.on('connect', function () {
    createUser();
    displayUserID.innerText = myID;
  });

  socket.on('updateScreen', drawScreen);
  displayUserID = document.querySelector("#playerID");
  setInterval(sendUpdate, 20);

  window.addEventListener('mousemove', function (evt) {
    mousePosition = getMousePosition(canvas, evt);
  }, false);
};

window.onload = init;
