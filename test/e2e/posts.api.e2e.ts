import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  BlogCreateModel,
  BlogViewModel,
} from '../../src/features/blogs/models/blogs.models-sql';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import { blogsTestManager } from '../utils/blogsTestManager';
import { authBasicHeader } from '../utils/export_data_functions';
import {
  PostCreateModelFromBlog,
  PostUpdateModel,
  PostViewModel,
} from '../../src/features/posts/models/posts.models-sql';
import { postsTestManager } from '../utils/postsTestManager';
import { likeStatus } from '../../src/features/likes/models/likes.models-sql';
import { createTestAPP } from './createTestAPP';

describe('/Testing posts', () => {
  let app: INestApplication;
  let blog: BlogViewModel;
  let server: any;

  beforeAll(async () => {
    // Стартуем приложение
    app = await createTestAPP();
    server = app.getHttpServer();

    // Заполняем необходимые начальные данные
    await request(server).delete(`${RouterPaths.testing}/all-data`);

    // Создаем блог, к которому будем прикреплять посты
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
    blog = createdBlog!;
  });

  it('should return 404 and empty array', async () => {
    await request(server).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should return 400 for nit uuid ID post', async () => {
    await request(server)
      .get(`${RouterPaths.posts}/-22222222220`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return 404 for not existing post', async () => {
    await request(server)
      .get(`${RouterPaths.posts}/000e0000-e00b-00d0-a000-000000000000`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should not create POST without AUTH', async () => {
    const data: PostCreateModelFromBlog = {
      title: 'amazing Math_1',
      shortDescription: 'Short description about new amazing Math_1 course',
      content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
      blogId: blog.id,
    };

    await postsTestManager.createPost(app, data, HttpStatus.UNAUTHORIZED);

    await request(server).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  /*
   * Created variable outside the next test to have option use
   * id of created post in the further put test
   * */
  let createdPost1: PostViewModel = {
    id: '',
    title: '',
    shortDescription: 'shortDescription',
    content: '',
    blogId: '',
    blogName: '',
    createdAt: '',
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
      newestLikes: [],
    },
  };

  it('should not create post with AUTH and correct input data but non existed blogID', async () => {
    const data: PostCreateModelFromBlog = {
      title: 'amazing Math_1',
      shortDescription: 'Short description about new amazing Math_1 course',
      content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
      blogId: '-2222222222',
    };

    await postsTestManager.createPost(
      app,
      data,
      HttpStatus.BAD_REQUEST,
      authBasicHeader,
    );

    await request(server).get(RouterPaths.posts).expect(HttpStatus.OK, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should create post with AUTH and correct input data', async () => {
    const data: PostCreateModelFromBlog = {
      title: 'amazing Math_1',
      shortDescription: 'Short description about new amazing Math_1 course',
      content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
      blogId: blog.id,
    };

    const { createdPost } = await postsTestManager.createPost(
      app,
      data,
      HttpStatus.CREATED,
      authBasicHeader,
    );

    createdPost1 = createdPost!;

    await request(server)
      .get(RouterPaths.posts)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: createdPost1.id,
            title: createdPost1.title,
            shortDescription: createdPost1.shortDescription,
            content: createdPost1.content,
            blogId: createdPost1.blogId,
            blogName: createdPost1.blogName,
            createdAt: createdPost1.createdAt,
            extendedLikesInfo: createdPost1.extendedLikesInfo,
          },
        ],
      });
  });

  let createdPost2: PostViewModel = {
    id: '',
    title: '',
    shortDescription: 'shortDescription',
    content: '',
    blogId: '',
    blogName: '',
    createdAt: '',
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
      newestLikes: [],
    },
  };

  it('should create one more post with AUTH and correct input data', async () => {
    const data: PostCreateModelFromBlog = {
      title: 'LaLand VS Ints',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
      blogId: blog.id,
    };

    const { createdPost } = await postsTestManager.createPost(
      app,
      data,
      HttpStatus.CREATED,
      authBasicHeader,
    );

    createdPost2 = createdPost!;

    await request(server)
      .get(RouterPaths.posts)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: createdPost2.id,
            title: createdPost2.title,
            shortDescription: createdPost2.shortDescription,
            content: createdPost2.content,
            blogId: createdPost2.blogId,
            blogName: createdPost2.blogName,
            createdAt: createdPost2.createdAt,
            extendedLikesInfo: createdPost1.extendedLikesInfo,
          },
          {
            id: createdPost1.id,
            title: createdPost1.title,
            shortDescription: createdPost1.shortDescription,
            content: createdPost1.content,
            blogId: createdPost1.blogId,
            blogName: createdPost1.blogName,
            createdAt: createdPost1.createdAt,
            extendedLikesInfo: createdPost2.extendedLikesInfo,
          },
        ],
      });
  });

  it('should not update post with AUTH and incorrect input data', async () => {
    const data1: PostUpdateModel = {
      title: '',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    console.log(
      `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
    );

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .send(data1)
      .expect(HttpStatus.BAD_REQUEST);

    const data2: PostUpdateModel = {
      title: 'Correct title',
      shortDescription: '',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .send(data2)
      .expect(HttpStatus.BAD_REQUEST);

    const data3: PostUpdateModel = {
      title: 'Correct title',
      shortDescription: 'Correct short description',
      content: '',
    };

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .send(data3)
      .expect(HttpStatus.BAD_REQUEST);

    await request(server)
      .get(`${RouterPaths.posts}/${createdPost2.id}`)
      .expect(HttpStatus.OK, {
        id: createdPost2.id,
        title: createdPost2.title,
        shortDescription: createdPost2.shortDescription,
        content: createdPost2.content,
        blogId: createdPost2.blogId,
        blogName: createdPost2.blogName,
        createdAt: createdPost2.createdAt,
        extendedLikesInfo: createdPost2.extendedLikesInfo,
      });
  });

  it('should update post with AUTH and correct input data', async () => {
    const data: PostUpdateModel = {
      title: 'NEW TITLE !',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.NO_CONTENT);

    createdPost2.title = 'NEW TITLE !';

    await request(server)
      .get(`${RouterPaths.posts}/${createdPost2.id}`)
      .expect(HttpStatus.OK, createdPost2);
  });

  it('should not update post without AUTH and correct input data', async () => {
    const data: PostUpdateModel = {
      title: 'NEW TITLE 2',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .send(data)
      .expect(HttpStatus.UNAUTHORIZED);

    await request(server)
      .get(`${RouterPaths.posts}/${createdPost2.id}`)
      .expect(HttpStatus.OK, createdPost2);
  });

  it('should not update post with AUTH and nonexistent post id', async () => {
    const data: PostUpdateModel = {
      title: 'NEW TITLE 2',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    await request(server)
      .put(
        `/${blog.id}${RouterPaths.posts}/000e0000-e00b-00d0-a000-000000000000`,
      )
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should not update post with AUTH and nonexistent blog id', async () => {
    const data: PostUpdateModel = {
      title: 'NEW TITLE 2',
      shortDescription:
        'In this article we will look at two great movies - La la land and Interstellar',
      content:
        'La la land and Interstellar La la land and Interstellar La la land and Interstellar La la land and Interstellar',
    };

    await request(server)
      .put(
        `${RouterPaths.blogsSA}/000e0000-e00b-00d0-a000-000000000000${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should not delete post without AUTH', async () => {
    await request(server)
      .delete(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should not delete post with incorrect ID (not uuid)', async () => {
    await request(server)
      .delete(`${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/-2222222`)
      .set(authBasicHeader)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should not delete post with incorrect ID (not uuid)', async () => {
    await request(server)
      .delete(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/000e0000-e00b-00d0-a000-000000000000`,
      )
      .set(authBasicHeader)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete post with correct ID and AUTH', async () => {
    await request(server)
      .delete(
        `${RouterPaths.blogsSA}/${blog.id}${RouterPaths.posts}/${createdPost2.id}`,
      )
      .set(authBasicHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(server)
      .get(RouterPaths.posts)
      .expect(HttpStatus.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: createdPost1.id,
            title: createdPost1.title,
            shortDescription: createdPost1.shortDescription,
            content: createdPost1.content,
            blogId: createdPost1.blogId,
            blogName: createdPost1.blogName,
            createdAt: createdPost1.createdAt,
            extendedLikesInfo: createdPost1.extendedLikesInfo,
          },
        ],
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
