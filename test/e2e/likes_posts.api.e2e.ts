import request from 'supertest';
import {
    PostCreateModelFromBlog,
    PostViewModel,
} from '../../src/features/posts/models/posts.models-sql';
import {
    UserInputModel, 
    UserViewModel,
} from '../../src/features/users/models/users.models.sql';
import {
    BlogCreateModel,
    BlogViewModel,
} from '../../src/features/blogs/models/blogs.models-sql';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { createTestAPP } from '../utils/createTestAPP';
import { blogsTestManager } from '../utils/blogsTestManager';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import { authBasicHeader } from '../utils/export_data_functions';
import { postsTestManager } from '../utils/postsTestManager';
import { usersTestManager } from '../utils/usersTestManager';
import { JwtService } from '../../src/infrastructure/jwt/jwt.service';
import {
    likeInputModel,
    likeStatus,
} from '../../src/features/likes/models/likes.models-sql';

describe('/Testing likes', () => {
    let post1: PostViewModel;
    let post2: PostViewModel;
    let user1: UserViewModel;
    let user2: UserViewModel;
    let user3: UserViewModel;
    let blog: BlogViewModel;
    let authJWTHeader1: Record<string, string>;
    let AccessToken1: string;
    let AccessToken2: string;
    let AccessToken3: string;
    let app: INestApplication;
    let server: any;
    let jwtService: JwtService;

    const like = likeStatus.Like;
    const dislike = likeStatus.Dislike;
    const none = likeStatus.None;

    beforeAll(async () => {
        app = await createTestAPP();
        server = app.getHttpServer();

        jwtService = app.get(JwtService);

        await request(server).delete(`${RouterPaths.testing}/all-data`);

        // Создаем блог, к которому будем прикреплять пост
        const dataBlog: BlogCreateModel = {
            name: 'Richard Feynman',
            description: 'Bingo article about Richard Feynman',
            websiteUrl: 'https://telegra.ph/Richard-Feynman-05-11',
        };

        const { createdBlog } = await blogsTestManager.createBlog(
            app,
            dataBlog,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        blog = createdBlog!;

        // Создаем пост1, к которому будем прикреплять комменты
        const dataPost1: PostCreateModelFromBlog = {
            title: 'amazing Math_1',
            shortDescription: 'Short description about new amazing Math_1 course',
            content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
            blogId: blog.id,
        };

        const { createdPost: createdPost1 } = await postsTestManager.createPost(
            app,
            dataPost1,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        post1 = createdPost1!;

        const { createdPost: createdPost2 } = await postsTestManager.createPost(
            app,
            dataPost1,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        post2 = createdPost2!;

        //Создаем юзера1, чтобы оставлять  лайки

        const dataUser: UserInputModel = {
            login: 'User01',
            password: 'Password01',
            email: 'email01@fishmail2dd.com',
        };

        const { createdUser: createdUser1 } = await usersTestManager.createUser(
            app,
            dataUser,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        user1 = createdUser1!;

        AccessToken1 = await jwtService.createJWT(user1);
        authJWTHeader1 = { "Authorization": `Bearer ${AccessToken1}` };

        //Создаем юзера2, чтобы оставлять  лайки

        const dataUser2: UserInputModel = {
            login: 'User02',
            password: 'Password02',
            email: 'email02@fishmail3dd.com',
        };

        const { createdUser: createdUser2 } = await usersTestManager.createUser(
            app,
            dataUser2,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        user2 = createdUser2!;

        AccessToken2 = await jwtService.createJWT(user2);

        //Создаем юзера3, чтобы оставлять комменты и лайки

        const dataUser3: UserInputModel = {
            login: 'User02',
            password: 'Password02',
            email: 'email02@fishmail3dd.com',
        };

        const { createdUser: createdUser3 } = await usersTestManager.createUser(
            app,
            dataUser3,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        user3 = createdUser3!;

        AccessToken3 = await jwtService.createJWT(user3);
    });

    async function setLikeStatus(
        postId: string,
        userToken: string,
        status: string,
    ) {
        await request(server)
            .put(`${RouterPaths.posts}/${postId}/like-status`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ likeStatus: status })
            .expect(HttpStatus.NO_CONTENT);
    }

    async function getLikeInfo(postId: string, userToken: string) {
        const response = await request(server)
            .get(`${RouterPaths.posts}/${postId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(HttpStatus.OK);

        return response.body.extendedLikesInfo;
    }

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post1).not.toBeNull();
        expect(post2).not.toBeNull();
        expect(user1).not.toBeNull();
        expect(user2).not.toBeNull();
        expect(user3).not.toBeNull();
    });

    it('Like without auth should return 401 ERROR', async () => {
        const data: likeInputModel = {
            likeStatus: like,
        };

        await request(server)
            .put(`${RouterPaths.posts}/${post1.id}/like-status`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Like for incorrect commentID should return 404 ERROR', async () => {
        const data: likeInputModel = {
            likeStatus: like,
        };

        await request(server)
            .put(
                `${RouterPaths.posts}/000e0000-e00b-00d0-a000-000000000000/like-status`,
            )
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('Incorrect input data. 400 Error', async () => {
        const data = {
            likeStatus: 'Super',
        };

        await request(server)
            .put(`${RouterPaths.posts}/${post1.id}/like-status`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Successful like with AUTH', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        const response = await getLikeInfo(post1.id, AccessToken1);

        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });
    });

    it('GET COMMENT without AUTH. Status None', async () => {
        const response = await getLikeInfo(post1.id, '');

        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: none,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });
    });

    it('Like User1 + Dislike user2', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        const response1 = await getLikeInfo(post1.id, AccessToken1);
        expect(response1).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        await setLikeStatus(post1.id, AccessToken2, dislike);
        const response2 = await getLikeInfo(post1.id, AccessToken2);

        expect(response2).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        const response3 = await getLikeInfo(post1.id, AccessToken1);

        expect(response3).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
        await setLikeStatus(post1.id, AccessToken2, none);

        const response4 = await getLikeInfo(post1.id, AccessToken1);

        expect(response4).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
            newestLikes: [],
        });
    });

    it('should reset like/dislike status to none', async () => {
        await setLikeStatus(post1.id, AccessToken1, none);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
            newestLikes: [],
        });
    });

    it('should set like status and then change to dislike', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('should set dislike status and then change to like', async () => {
        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('should handle dislike, reset, and then like', async () => {
        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('should handle like, reset, and then dislike', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, none);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('should handle like, and then like again', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, like);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('should handle dislike,and then dislike again', async () => {
        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: expect.any(Array), // или конкретное ожидание, если известно
        });

        await setLikeStatus(post1.id, AccessToken1, dislike);
        expect(await getLikeInfo(post1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
            newestLikes: [],
        });

        await setLikeStatus(post1.id, AccessToken1, none);
    });

    it('LIKES by different users', async () => {
        await setLikeStatus(post1.id, AccessToken1, like);
        const response = await getLikeInfo(post1.id, AccessToken1);
        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        await setLikeStatus(post1.id, AccessToken2, like);
        const response2 = await getLikeInfo(post1.id, AccessToken1);
        expect(response2).toEqual({
            likesCount: 2,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user2.id,
                    login: user2.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });

        await setLikeStatus(post1.id, AccessToken3, like);
        const response3 = await getLikeInfo(post1.id, AccessToken1);
        expect(response3).toEqual({
            likesCount: 3,
            dislikesCount: 0,
            myStatus: like,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: user3.id,
                    login: user3.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user2.id,
                    login: user2.login,
                },
                {
                    addedAt: expect.any(String),
                    userId: user1.id,
                    login: user1.login,
                },
            ],
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
