import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = 7200;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
}
bootstrap();
