import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
config();

const configService = new ConfigService();

export const getDatabaseConfig = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  useUTC: true,
  url: configService.get<string>('DATABASE_URL'),
  logging: configService.get<string>('NODE_ENV') == 'development',
  synchronize: configService.get<string>('NODE_ENV') == 'development',
  entities: [`dist/**/entities/*.{ts,js}`],
  migrations: [`dist/db/migrations/*.js`],
  namingStrategy: new SnakeNamingStrategy(),
});

export const dataSourceOptions: DataSourceOptions =
  getDatabaseConfig(configService);

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
