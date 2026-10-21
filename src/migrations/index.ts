import * as migration_20261021_110145_initial from './20261021_110145_initial';
import * as migration_20261021_133858_storage_fields from './20261021_133858_storage_fields';

export const migrations = [
  {
    up: migration_20261021_110145_initial.up,
    down: migration_20261021_110145_initial.down,
    name: '20261021_110145_initial',
  },
  {
    up: migration_20261021_133858_storage_fields.up,
    down: migration_20261021_133858_storage_fields.down,
    name: '20261021_133858_storage_fields'
  },
];
