import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import {
  BlogCreateModel,
  BlogUpdateModel,
  BlogViewModel,
} from '../../src/features/blogs/models/blogs.models-sql';
import { authBasicHeader } from '../utils/export_data_functions';
import { blogsTestManager } from '../utils/blogsTestManager';
import cookieParser from 'cookie-parser';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from '../../src/middlewares/exception.filter';
import { useContainer } from 'class-validator';

describe('/Testing blogs', () => {
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

  it('should return 404 and empty array', async () => {
    await request(app.getHttpServer())
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it('should return 400 for not blogID not uuid', async () => {
    await request(app.getHttpServer())
      .get(`${RouterPaths.blogs}/-22222222220`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return 404 for not existing blog', async () => {
    await request(app.getHttpServer())
      .get(`${RouterPaths.blogs}/000e0000-e00b-00d0-a000-000000000000`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should not create blog without AUTH', async () => {
    const data: BlogCreateModel = {
      name: 'Richard Feynman',
      description: 'Bingo article about Richard Feynman',
      websiteUrl: 'https://telegra.ph/Richard-Feynman-05-11',
    };

    await blogsTestManager.createBlog(app, data, HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  /*
   * Created variable outside the next test to have option use
   * id of created blog in the further put test
   * */
  let createdBlog1: BlogViewModel = {
    id: '',
    name: '',
    description: '',
    websiteUrl: '',
    createdAt: '',
    isMembership: false,
  };

  it('should create blog with AUTH and correct input data', async () => {
    const data: BlogCreateModel = {
      name: 'Richard Feynman',
      description: 'Bingo article about Richard Feynman',
      websiteUrl: 'https://telegra.ph/Richard-Feynman-05-11',
    };

    const { createdBlog } = await blogsTestManager.createBlog(
      app,
      data,
      HttpStatus.CREATED,
      authBasicHeader,
    );

    createdBlog1 = createdBlog!;

    await request(app.getHttpServer())
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: createdBlog1.id,
            name: createdBlog1.name,
            description: createdBlog1.description,
            websiteUrl: createdBlog1.websiteUrl,
            createdAt: createdBlog1.createdAt,
            isMembership: createdBlog1.isMembership,
          },
        ],
      });
  });

  let createdBlog2: BlogViewModel = {
    id: '',
    name: '',
    description: '',
    websiteUrl: '',
    createdAt: '',
    isMembership: false,
  };

  it('should create one more blog with AUTH and correct input data', async () => {
    const data: BlogCreateModel = {
      name: 'Red Fox',
      description: 'Bingo article about Red Fox',
      websiteUrl: 'https://telegra.ph/Red-Fox-03-33',
    };

    const { createdBlog } = await blogsTestManager.createBlog(
      app,
      data,
      HttpStatus.CREATED,
      authBasicHeader,
    );

    createdBlog2 = createdBlog!;

    await request(app.getHttpServer())
      .get(RouterPaths.blogs)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: createdBlog2.id,
            name: createdBlog2.name,
            description: createdBlog2.description,
            websiteUrl: createdBlog2.websiteUrl,
            createdAt: createdBlog2.createdAt,
            isMembership: createdBlog2.isMembership,
          },
          {
            id: createdBlog1.id,
            name: createdBlog1.name,
            description: createdBlog1.description,
            websiteUrl: createdBlog1.websiteUrl,
            createdAt: createdBlog1.createdAt,
            isMembership: createdBlog1.isMembership,
          },
        ],
      });
  });

  it('should not update blog with AUTH and incorrect input data', async () => {
    const data: BlogUpdateModel = {
      name: '',
      description: 'Bingo article about Richard Feynman 2222',
      websiteUrl: 'https://telegra.ph/Richard-Fey2222nman-05-11',
    };

    await request(app.getHttpServer())
      .put(`${RouterPaths.blogsSA}/${createdBlog1.id}`)
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.BAD_REQUEST);

    await request(app.getHttpServer())
      .get(`${RouterPaths.blogs}/${createdBlog1.id}`)
      .expect(HttpStatus.OK, {
        id: createdBlog1.id,
        name: createdBlog1.name,
        description: createdBlog1.description,
        websiteUrl: createdBlog1.websiteUrl,
        createdAt: createdBlog1.createdAt,
        isMembership: createdBlog1.isMembership,
      });
  });

  it('should update blog with AUTH and correct input data', async () => {
    const data: BlogUpdateModel = {
      name: 'Richard Feynman',
      description: 'Bingo article about Richard Feynman 2222',
      websiteUrl: 'https://telegra.ph/Richard-Fey2222nman-05-11',
    };

    await request(app.getHttpServer())
      .put(`${RouterPaths.blogsSA}/${createdBlog1.id}`)
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.NO_CONTENT);

    createdBlog1.description = 'Bingo article about Richard Feynman 2222';
    createdBlog1.websiteUrl = 'https://telegra.ph/Richard-Fey2222nman-05-11';

    await request(app.getHttpServer())
      .get(`${RouterPaths.blogs}/${createdBlog1.id}`)
      .expect(HttpStatus.OK, createdBlog1);
  });

  it('should not update blog without AUTH and correct input data', async () => {
    const data: BlogUpdateModel = {
      name: 'Richard Feynman',
      description: 'Bingo article about Richard Feynman 33333',
      websiteUrl: 'https://telegra.ph/Richard-Fey33333nman-05-11',
    };

    await request(app.getHttpServer())
      .put(`${RouterPaths.blogsSA}/${createdBlog1.id}`)
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .get(`${RouterPaths.blogs}/${createdBlog1.id}`)
      .expect(HttpStatus.OK, createdBlog1);
  });

  it('should not update blog with AUTH and nonexistent id ', async () => {
    const data: BlogUpdateModel = {
      name: 'Richard Feynman',
      description: 'Bingo article about Richard Feynman 2222',
      websiteUrl: 'https://telegra.ph/Richard-Fey2222nman-05-11',
    };

    await request(app.getHttpServer())
      .put(`${RouterPaths.blogsSA}/000e0000-e00b-00d0-a000-000000000000`)
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
  });

  afterAll(async () => {
    await app.close();
  });
});
