const gameData = require('./gameData.js');


const moveEnemies = (data) => {
  const enemies = data;

  const keys = Object.keys(enemies);

  for (let i = 0; i < keys.length; i++) {
    const enemy = enemies[keys[i]];
    enemy.y += enemy.speed;
    enemies[keys[i]] = enemy;
  }
  return enemies;
};

const checkEnemyPosition = (data, barrierHeight) => {
  const enemies = data;

  const keys = Object.keys(enemies);

  for (let i = 0; i < keys.length; i++) {
    const enemy = enemies[keys[i]];
    if (enemy.y > barrierHeight) {
      delete enemies[keys[i]];
    }
  }
  return enemies;
};

const cullDead = (data) => {
  const enemies = data;
  const keys = Object.keys(enemies);

  for (let i = 0; i < keys.length; i++) {
    const enemy = enemies[keys[i]];
    console.dir(enemy);
    if (enemy.hp <= 0) {
      delete enemies[keys[i]];
    }
  }
  return enemies;
};

const isWaveOver = (data) => {
  const enemies = data;
  const keys = Object.keys(enemies);

  if (keys.length === 0) {
    return true;
  }
  return false;
};


const loadWave = (wave) => {
  console.log(`Loading wave ${wave}`);
  let enemies = gameData.waves.wave1.waveEnemies;


  switch (wave) {
    case 0:
      enemies = gameData.waves.wave1.waveEnemies;
      break;
    case 1:
      enemies = gameData.waves.wave2.waveEnemies;
      break;
    default:
      enemies = gameData.waves.wave1.waveEnemies;
      console.log('Wave out of bounds, loading wave 1');
      break;
  }
  return enemies;
};


const checkHitClaim = (data, id) => {
  const enemies = data;
  const enemy = enemies[id];

  if (enemy && enemy.hp > 0) {
    enemy.hp--;
    enemies[enemy.id] = enemy;
    return enemies;
  }
  return enemies;
};


const update = (data, waveVar) => {
  let enemies = data;
  let currentWave = waveVar;

  enemies = cullDead(enemies);
  enemies = checkEnemyPosition(enemies);
  enemies = moveEnemies(enemies);

  if (isWaveOver(enemies)) {
    currentWave++;
    enemies = loadWave(enemies, currentWave);
  }
};

module.exports = {
  update,
  loadWave,
  checkHitClaim,
};
