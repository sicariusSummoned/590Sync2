const waves = {
  wave1: {
    waveName: 'Round One',
    waveEnemies: {
      0: {
        id: 0,
        x: 50,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 2,
        hp: 1,
      },
      1: {
        id: 1,
        x: 100,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 2,
        hp: 1,

      },
      2: {
        id: 2,
        x: 300,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 2,
        hp: 1,

      },
    },
  },
  wave2: {
    waveName: 'Round Two',
    waveEnemies: {
      0: {
        id: 0,
        x: 50,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 4,
        hp: 1,
      },
      1: {
        id: 1,
        x: 100,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 4,
        hp: 1,

      },
      2: {
        id: 2,
        x: 300,
        y: 0,
        radius: 30,
        color: 'green',
        speed: 4,
        hp: 1,

      },
    },
  },
};
module.exports = {
  waves,
};
