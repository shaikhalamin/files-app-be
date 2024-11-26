import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from './common/interceptor/global-response-interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  //app.useStaticAssets(join(__dirname, './public'));
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.enableCors();

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseTransformInterceptor(reflector));

  const config = new DocumentBuilder()
    .setTitle('Node backend api')
    .setDescription('Swagger docs for backend apis')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-docs', app, document);

  const PORT = configService.get<number>('PORT', 8056);

  await app.listen(PORT, '0.0.0.0', async () => {
    return Logger.log(`Application started on port ${await app.getUrl()}`);
  });
}
bootstrap();
