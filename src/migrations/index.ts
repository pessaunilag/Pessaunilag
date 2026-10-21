import * as migration_20261021_110145_initial from './20261021_110145_initial';

export const migrations = [
  {
    up: migration_20261021_110145_initial.up,
    down: migration_20261021_110145_initial.down,
    name: '20261021_110145_initial'
  },
];
