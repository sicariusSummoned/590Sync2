const deepCopy = require('lodash/cloneDeep.js');

const gameData = require('./gameData.js');

let health = 30;

const getHealth = () => health;

const moveEnemies = (data) => {
  if (data !== null && data !== undefined) {
    const enemies = data;

    const keys = Object.keys(enemies);

    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      enemy.y += enemy.speed;
      enemies[keys[i]] = enemy;
    }
    return enemies;
  }
  return null;
};

const checkEnemyPosition = (data, barrierHeight) => {
  if (data !== null && data !== undefined) {
    const enemies = data;
    const keys = Object.keys(enemies);
    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      if (enemy.y > barrierHeight) {
        enemy.hp = 0;
        health -= enemy.damage;

        console.log(health, enemy.damage);
      }
    }
    return enemies;
  }
  return null;
};


const cullDead = (data) => {
  if (data !== null && data !== undefined) {
    const enemies = data;
    const keys = Object.keys(enemies);

    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      if (enemy.hp <= 0) {
        delete enemies[keys[i]];
      }
    }
    return enemies;
  }
  return null;
};

const isWaveOver = (data) => {
  if (data !== null && data !== undefined) {
    const enemies = data;
    const keys = Object.keys(enemies);


    if (keys.length === 0) {
      return true;
    }
    return false;
  }
  return true;
};

//Ugly, but functional. 
//If I had more time I would have liked
//to find a more elegant solution to my loading problem.
const loadWave = (wave) => {
  console.log(`Loading wave ${wave}`);

  const waveData = {
    enemies: {},
    waveName: 'null',
  };



  switch (wave) {
    case -1:
      waveData.enemies = deepCopy(gameData.waves.waveEND.waveEnemies);
      waveData.waveName = gameData.waves.waveEND.waveName;
      console.log('Game Over');
      break;
    case 0:
      waveData.enemies = deepCopy(gameData.waves.wave1.waveEnemies);
      waveData.waveName = gameData.waves.wave1.waveName;
      break;
    case 1:
      waveData.enemies = deepCopy(gameData.waves.wave2.waveEnemies);
      waveData.waveName = gameData.waves.wave2.waveName;
      break;
    case 2:
      waveData.enemies = deepCopy(gameData.waves.wave3.waveEnemies);
      waveData.waveName = gameData.waves.wave3.waveName;
      break;
    case 3:
      waveData.enemies = deepCopy(gameData.waves.wave4.waveEnemies);
      waveData.waveName = gameData.waves.wave4.waveName;
      break;
    case 4:
      waveData.enemies = deepCopy(gameData.waves.wave5.waveEnemies);
      waveData.waveName = gameData.waves.wave5.waveName;
      break;
    case 5:
      waveData.enemies = deepCopy(gameData.waves.wave6.waveEnemies);
      waveData.waveName = gameData.waves.wave6.waveName;
      break;
    case 6:
      waveData.enemies = deepCopy(gameData.waves.wave7.waveEnemies);
      waveData.waveName = gameData.waves.wave7.waveName;
      break;
    case 7:
      waveData.enemies = deepCopy(gameData.waves.wave8.waveEnemies);
      waveData.waveName = gameData.waves.wave8.waveName;
      break;
    case 8:
      waveData.enemies = deepCopy(gameData.waves.wave9.waveEnemies);
      waveData.waveName = gameData.waves.wave9.waveName;
      break;
    case 9:
      waveData.enemies = deepCopy(gameData.waves.wave10.waveEnemies);
      waveData.waveName = gameData.waves.wave10.waveName;
      break;
    default:
      waveData.enemies = deepCopy(gameData.waves.wave1.waveEnemies);
      waveData.waveName = gameData.waves.wave1.waveName;
      break;
  }


  return waveData;
};


const checkHitClaim = (data, id) => {
  const enemies = data;
  const enemy = enemies[id];

  if (enemy && enemy.hp > 0) {
    enemy.hp--;
    enemies[enemy.id] = enemy;
  }
  return enemies;
};


const update = (data, waveVar, canvasHeight) => {
  let enemies = data;

  enemies = cullDead(enemies);
  enemies = checkEnemyPosition(enemies, canvasHeight);
  enemies = moveEnemies(enemies);

  return enemies;
};

module.exports = {
  update,
  loadWave,
  checkHitClaim,
  isWaveOver,
  getHealth,
};
