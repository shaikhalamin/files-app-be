import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './common/schema/config-schema';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { getDatabaseConfig } from 'db/data-source';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exception/exception-filter';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './modules/v1/user/user.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { StorageFilesModule } from './modules/v1/storage-files/storage-files.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
export const getDatabaseConfig = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  useUTC: true,
  url: configService.get<string>('DATABASE_URL'),
  logging: configService.get<string>('NODE_ENV') == 'development',
  synchronize: configService.get<string>('NODE_ENV') == 'development',
  // entities: [`dist/**/entities/*.{ts,js}`],
  entities: [`${__dirname}/**/entities/*.{ts,js}`],
  migrations: [`dist/db/migrations/*.js`],
  namingStrategy: new SnakeNamingStrategy(),
});
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      name: 'default',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URL') || 'redis://localhost:6379',
        }),
      }),
      inject: [ConfigService],
    }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '../public'),
    //   serveRoot: '/public',
    // }),
    UserModule,
    AuthModule,
    StorageFilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
