import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import process from 'process';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from './middlewares/exception.filter';

const port = process.env.PORT || 7200;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      // Автоматически преобразует входящие данные по типам. Например id из params делает из строки
      // числом, если указано @Params('id') userId: number
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];

        errors.forEach((e) => {
          const constrKeys = Object.keys(e.constraints!);
          constrKeys.forEach((ckey) => {
            // @ts-ignore
            errorsForResponse.push({
              message: e.constraints![ckey],
              field: e.property,
            });
          });
        });

        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  await app.listen(port);
}
bootstrap();
