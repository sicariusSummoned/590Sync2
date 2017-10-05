const gameData = require('./gameData.js');


const moveEnemies = (data) => {
  if (data != null && data != undefined) {
    const enemies = data;

    const keys = Object.keys(enemies);

    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      enemy.y += enemy.speed;
      enemies[keys[i]] = enemy;
    }
    return enemies;
  }
};

const checkEnemyPosition = (data, barrierHeight) => {
  if (data != null && data != undefined) {
    const enemies = data;

    const keys = Object.keys(enemies);

    for (let i = 0; i < keys.length; i++) {
      const enemy = enemies[keys[i]];
      if (enemy.y > barrierHeight) {
        delete enemies[keys[i]];
      }
    }
    return enemies;
  }
};

const cullDead = (data) => {
  if (data != null && data != undefined) {

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
};

const isWaveOver = (data) => {
  if (data != null && data != undefined) {
    const enemies = data;
    const keys = Object.keys(enemies);

    if (keys.length === 0) {
      return true;
    }
    return false;
  }else{
    return true;
  }

};


const loadWave = (wave) => {
  console.log(`Loading wave ${wave}`);
  
  let waveData = {
    enemies:{},
    waveName:"null",
  }


  switch (wave) {
    case 0:
      Object.assign(waveData.enemies,gameData.waves.wave1.waveEnemies);
      waveData.waveName = gameData.waves.wave1.waveName;
      break;
    case 1:
      console.log('wave 1 reached');
      Object.assign(waveData.enemies,gameData.waves.wave2.waveEnemies);
      waveData.waveName = gameData.waves.wave2.waveName;
      break;
    default:
      Object.assign(waveData.enemies,gameData.waves.wave1.waveEnemies);
      waveData.waveName = gameData.waves.wave1.waveName;
      //waveData.enemies = gameData.waves.waveEND.waveEnemies;
      //waveData.waveName = gameData.waves.waveEND.waveName;
      console.log('Game Over');
      break;
  }
  return waveData;
};


const checkHitClaim = (data, id) => {
  const enemies = data;
  const enemy = enemies[id];
  console.dir(enemy);

  if (enemy && enemy.hp > 0) {
    enemy.hp--;
    enemies[enemy.id] = enemy;
    return enemies;
  }
  return enemies;
};


const update = (data, waveVar, canvasHeight) => {
  let enemies = data;

  enemies = cullDead(enemies);
  enemies = checkEnemyPosition(enemies, canvasHeight);
  enemies = moveEnemies(enemies);
};

module.exports = {
  update,
  loadWave,
  checkHitClaim,
  isWaveOver,
};
