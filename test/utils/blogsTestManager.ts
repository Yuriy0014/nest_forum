import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogCreateModel } from '../../src/features/blogs/models/blogs.models-sql';
import { HttpStatusType } from './export_data_functions';
import { RouterPaths } from '../../src/helpers/RouterPaths';

export const blogsTestManager = {
  async createBlog(
    app: INestApplication,
    data: BlogCreateModel,
    expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
    headers = {},
  ) {
    const response = await request(app)
      .post(RouterPaths.blogs)
      .set(headers)
      .send(data)
      .expect(expectedStatusCode);

    let createdBlog = null;

    if (expectedStatusCode === HttpStatus.CREATED) {
      createdBlog = response.body;

      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: data.name,
        description: data.description,
        websiteUrl: data.websiteUrl,
        createdAt: expect.any(String),
        isMembership: false,
      });
    }

    return { response, createdBlog };
  },
};
