import request from 'supertest';
import { createTestAPP } from '../utils/createTestAPP';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { RouterPaths } from '../../src/helpers/RouterPaths';

describe('testing ip restriction for registration', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await createTestAPP();
    server = app.getHttpServer();
  });

  it('Delete all data before tests', async () => {
    await request(server)
      .delete(`${RouterPaths.testing}/all-data`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should return 429 error ', async () => {
    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User16666',
        password: 'User16666',
        email: 'User1@mail.ru',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User2666',
        password: 'User2666',
        email: 'User2@mail.ru',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User3666',
        password: 'User3666',
        email: 'User3@mail.ru',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User4666',
        password: 'User4666',
        email: 'User4@mail.ru',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User5666',
        password: 'User5666',
        email: 'User5@mail.ru',
      })
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: 'User6666',
        password: 'User6666',
        email: 'User6@mail.ru',
      })
      .expect(HttpStatus.TOO_MANY_REQUESTS);
  }, 50000);

  afterAll(async () => {
    await app.close();
  });
});
