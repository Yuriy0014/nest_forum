import request from 'supertest';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import cookieParser from 'cookie-parser';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../src/middlewares/exception.filter';
import { useContainer } from 'class-validator';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import { authBasicHeader } from '../utils/export_data_functions';
import {
  UserInputModel,
  UserViewModel,
} from '../../src/features/users/models/users.models.sql';
import { usersTestManager } from '../utils/usersTestManager';

describe('/Testing users', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    // Эта строка нужна чтобы работал DI в  custom validator декораторе
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init(); // как await app.listen(port);
  });

  it('Delete all data before tests', async () => {
    await request(app.getHttpServer())
      .delete(`${RouterPaths.testing}/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 401 without AUTH', async () => {
    await request(app.getHttpServer())
      .get(RouterPaths.users)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 200 and empty array', async () => {
    await request(app.getHttpServer())
      .get(RouterPaths.users)
      .set(authBasicHeader)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('should not create user without AUTH', async () => {
    const data: UserInputModel = {
      login: 'Feynman',
      password: 'Richard8=227',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(app, data, HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .get(RouterPaths.users)
      .set(authBasicHeader)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  let createdUser1: UserViewModel = {
    id: '',
    login: '',
    email: '',
    createdAt: '',
  };

  it('should NOT create user with AUTH and INCORRECT input data', async () => {
    // Короткий логин
    const data1: UserInputModel = {
      login: 'FY',
      password: 'Richard8=227',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data1,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    // Длинный логин
    const data2: UserInputModel = {
      login: 'FYFYFYFYFY2',
      password: 'Richard8=227',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data2,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );
    // Запрещенный символ @ в логине
    const data3: UserInputModel = {
      login: 'Feynman@',
      password: 'Ric@hard8=227',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data3,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );
    // Пароль короткий и длинный
    const data4: UserInputModel = {
      login: 'Feynman@',
      password: '7',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data4,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    const data5: UserInputModel = {
      login: 'Feynman@',
      password: '777777777777777777771',
      email: 'Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data5,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    // Проверка email - короткий, длинный, не соответствует регулярному выражению

    const data6: UserInputModel = {
      login: 'Feynman',
      password: 'Richard8=227',
      email:
        'Feynman1918Feynman1918Feynman1918Feynman1918Feynman1918Feynman1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data6,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    const data7: UserInputModel = {
      login: 'Feynman',
      password: 'Richard8=227',
      email: 'Feynm@an1918@gmailya.com',
    };

    await usersTestManager.createUser(
      app,
      data7,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    const data8: UserInputModel = {
      login: 'Feynman',
      password: 'Richard8=227',
      email: 'Feynman1918@gmailya.co.m',
    };

    await usersTestManager.createUser(
      app,
      data8,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    await request(app.getHttpServer())
      .get(RouterPaths.users)
      .set(authBasicHeader)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('should create user with AUTH and correct input data', async () => {
    const data: UserInputModel = {
      login: 'Feynman',
      password: 'Richard8=227',
      email: 'Feynman1918@gmailya.com',
    };

    const { createdUser } = await usersTestManager.createUser(
      app,
      data,
      HttpStatus.CREATED,
      authBasicHeader,
    );

    createdUser1 = createdUser!;

    await request(app.getHttpServer())
      .get(RouterPaths.users)
      .set(authBasicHeader)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: createdUser1.id,
            login: data.login,
            email: data.email,
            createdAt: createdUser1.createdAt,
          },
        ],
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
