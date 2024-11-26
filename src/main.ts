import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
// import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from './common/interceptor/global-response-interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  const allowedHosts = (process.env.CORS_ALLOWED_HOSTS as string) || '*';
  app.enableCors({
    origin: allowedHosts.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

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

  const PORT = process.env.PORT || 8056;

  await app.listen(PORT, '0.0.0.0', async () => {
    return Logger.log(`Application started on port ${await app.getUrl()}`);
  });
}
bootstrap();
