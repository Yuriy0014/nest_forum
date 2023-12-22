import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { likeStatusModel } from '../../src/features/likes/models/likes.models-sql';
import { HttpStatusType } from './export_data_functions';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import { PostCreateModelFromBlog } from '../../src/features/posts/models/posts.models-sql';

class NewestLikesClass {
  constructor(
    protected likesCount: number,
    protected dislikesCount: number,
    protected myStatus: likeStatusModel,
  ) {}
}

export const postsTestManager = {
  async createPost(
    app: INestApplication,
    data: PostCreateModelFromBlog,
    expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
    headers = {},
  ) {
    console.log(`/${data.blogId}${RouterPaths.posts}`);

    const response = await request(app.getHttpServer())
      .post(`${RouterPaths.blogsSA}/${data.blogId}${RouterPaths.posts}`)
      .set(headers)
      .send(data)
      .expect(expectedStatusCode);

    let createdPost = null;

    if (expectedStatusCode === HttpStatus.CREATED) {
      createdPost = response.body;

      expect(createdPost).toEqual({
        id: expect.any(String),
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        blogId: data.blogId,
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          dislikesCount: expect.any(Number),
          likesCount: expect.any(Number),
          myStatus: expect.any(String),
          newestLikes: expect.any(Array<NewestLikesClass>),
        },
      });
    }

    return { response, createdPost };
  },
};
