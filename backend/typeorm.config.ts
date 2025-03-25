import { config } from 'dotenv';
config({ path: '.env.prod' });

import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from './src/config/database.config';

export default new DataSource({
  ...(databaseConfig as DataSourceOptions),
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
