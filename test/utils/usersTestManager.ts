import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from './export_data_functions';
import { UserInputModel } from '../../src/features/users/models/users.models.sql';
import { RouterPaths } from '../../src/helpers/RouterPaths';

export const usersTestManager = {
  async createUser(
    app: INestApplication,
    data: UserInputModel,
    expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
    headers = {},
  ) {
    const response = await request(app.getHttpServer())
      .post(RouterPaths.users)
      .set(headers)
      .send(data)
      .expect(expectedStatusCode);

    let createdUser = null;

    if (expectedStatusCode === HttpStatus.CREATED) {
      createdUser = response.body;

      expect(createdUser).toEqual({
        id: expect.any(String),
        login: data.login,
        email: data.email,
        createdAt: expect.any(String),
      });
    }
    return { response, createdUser };
  },
};
