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
    CommentInputModel,
    CommentViewModel,
} from '../../src/features/comments/models/comments.models-sql';
import {
    likeInputModel,
    likeStatus,
} from '../../src/features/likes/models/likes.models-sql';
import { commentTestManager } from '../utils/commentTestManager';

describe('/Testing likes', () => {
    let post: PostViewModel;
    let user1: UserViewModel;
    let user2: UserViewModel;
    let user3: UserViewModel;
    let blog: BlogViewModel;
    let AccessToken1: string;
    let AccessToken2: string;
    let AccessToken3: string;
    let authJWTHeader1: Record<string, string>;
    let authJWTHeader2: Record<string, string>;
    let app: INestApplication;
    let server: any;
    let jwtService: JwtService;

    const like = likeStatus.Like;
    const dislike = likeStatus.Dislike;
    const none = likeStatus.None;

    beforeAll(async () => {
        app = await createTestAPP();
        server = app.getHttpServer();

        await request(server).delete(`${RouterPaths.testing}/all-data`);

        jwtService = app.get(JwtService);

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

        // Создаем пост, к которому будем прикреплять комменты
        const dataPost: PostCreateModelFromBlog = {
            title: 'amazing Math_1',
            shortDescription: 'Short description about new amazing Math_1 course',
            content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
            blogId: blog!.id,
        };

        const { createdPost } = await postsTestManager.createPost(
            app,
            dataPost,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        post = createdPost!;

        //Создаем юзера1, чтобы оставлять комменты и лайки
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
        authJWTHeader1 = { Authorization: `Bearer ${AccessToken1}` };

        //Создаем юзера2, чтобы оставлять комменты и лайки

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
        authJWTHeader2 = { Authorization: `Bearer ${AccessToken2}` };

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
        commentId: string,
        userToken: string,
        status: string,
    ) {
        await request(server)
            .put(`${RouterPaths.comments}/${commentId}/like-status`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ likeStatus: status })
            .expect(HttpStatus.NO_CONTENT);
    }

    async function getLikeInfo(commentId: string, userToken: string) {
        const response = await request(server)
            .get(`${RouterPaths.comments}/${commentId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(HttpStatus.OK);

        return response.body.likesInfo;
    }

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user1).not.toBeNull();
    });

    // Создаем первый коммент от первого юзера

    let comment_1: CommentViewModel = {
        id: '',
        content: '',
        commentatorInfo: {
            userId: '',
            userLogin: '',
        },
        createdAt: '',
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        },
    };

    it('should create comment 1', async () => {
        const data: CommentInputModel = {
            content: 'I just called to say I love you',
        };

        const { createdComment } = await commentTestManager.createComment(
            app,
            post.id,
            data,
            HttpStatus.CREATED,
            authJWTHeader1,
        );

        comment_1 = createdComment!;

        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id: comment_1.id,
                        content: data.content,
                        commentatorInfo: comment_1.commentatorInfo,
                        createdAt: comment_1.createdAt,
                        likesInfo: comment_1.likesInfo,
                    },
                ],
            });
    });

    // Создаем второй коммент от первого юзера

    let comment_2: CommentViewModel = {
        id: '',
        content: '',
        commentatorInfo: {
            userId: '',
            userLogin: '',
        },
        createdAt: '',
        likesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        },
    };

    it('should create comment 2', async () => {
        const data: CommentInputModel = {
            content: 'I just called to say I love you 2',
        };

        const { createdComment } = await commentTestManager.createComment(
            app,
            post.id,
            data,
            HttpStatus.CREATED,
            authJWTHeader2,
        );

        comment_2 = createdComment!;

        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [
                    {
                        id: comment_2.id,
                        content: data.content,
                        commentatorInfo: comment_2.commentatorInfo,
                        createdAt: comment_2.createdAt,
                        likesInfo: comment_2.likesInfo,
                    },
                    {
                        id: comment_1.id,
                        content: comment_1.content,
                        commentatorInfo: comment_1.commentatorInfo,
                        createdAt: comment_1.createdAt,
                        likesInfo: comment_1.likesInfo,
                    },
                ],
            });
    });

    it('Like without auth should return 401 ERROR', async () => {
        const data: likeInputModel = {
            likeStatus: likeStatus.Like,
        };

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}/like-status`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Like for incorrect commentID should return 404 ERROR', async () => {
        const data: likeInputModel = {
            likeStatus: likeStatus.Like,
        };

        await request(server)
            .put(
                `${RouterPaths.comments}/000e0000-e00b-00d0-a000-000000000000/like-status`,
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
            .put(`${RouterPaths.comments}/${comment_1.id}/like-status`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('Successful like with AUTH', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        const response = await getLikeInfo(comment_1.id, AccessToken1);

        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: likeStatus.Like,
        });
    });

    it('GET COMMENT without AUTH. Status None', async () => {
        const response = await getLikeInfo(comment_1.id, '');

        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        });
    });

    it('Like User1 + Dislike user2', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        const response1 = await getLikeInfo(comment_1.id, AccessToken1);

        expect(response1).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: likeStatus.Like,
        });

        await setLikeStatus(comment_1.id, AccessToken2, dislike);
        const response2 = await getLikeInfo(comment_1.id, AccessToken2);
        expect(response2).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: likeStatus.Dislike,
        });

        const response3 = await getLikeInfo(comment_1.id, AccessToken1);
        expect(response3).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: likeStatus.Like,
        });

        await setLikeStatus(comment_1.id, AccessToken1, none);
        await setLikeStatus(comment_1.id, AccessToken2, none);
        const response4 = await getLikeInfo(comment_1.id, AccessToken1);
        expect(response4).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        });

        const response5 = await getLikeInfo(comment_1.id, AccessToken2);
        expect(response5).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        });
    });

    it('should reset like/dislike status', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, none);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
        });
    });

    it('should set like status', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
        });
    });

    it('should change from like to dislike', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, dislike);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
        });
    });

    it('should reset from dislike to none', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, none);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
        });
    });

    it('should handle dislike followed by reset and then like', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, dislike);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
        });

        await setLikeStatus(comment_1.id, AccessToken1, none);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
        });

        await setLikeStatus(comment_1.id, AccessToken1, like);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
        });
    });

    it('should handle like followed by reset and then dislike', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
        });

        await setLikeStatus(comment_1.id, AccessToken1, none);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: none,
        });

        await setLikeStatus(comment_1.id, AccessToken1, dislike);
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
        });
    });

    it('should maintain like status after multiple like requests', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        await setLikeStatus(comment_1.id, AccessToken1, like); // Повторный запрос на лайк
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: like,
        });
    });

    it('should maintain dislike status after multiple dislike requests', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, dislike);
        await setLikeStatus(comment_1.id, AccessToken1, dislike); // Повторный запрос на дизлайк
        expect(await getLikeInfo(comment_1.id, AccessToken1)).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: dislike,
        });
    });

    it('LIKES by different users', async () => {
        await setLikeStatus(comment_1.id, AccessToken1, like);
        const response = await getLikeInfo(comment_1.id, AccessToken1);

        expect(response).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: likeStatus.Like,
        });

        await setLikeStatus(comment_1.id, AccessToken2, like);
        const response2 = await getLikeInfo(comment_1.id, AccessToken1);

        expect(response2).toEqual({
            likesCount: 2,
            dislikesCount: 0,
            myStatus: likeStatus.Like,
        });

        await setLikeStatus(comment_1.id, AccessToken3, like);

        const response3 = await getLikeInfo(comment_1.id, AccessToken1);

        expect(response3).toEqual({
            likesCount: 3,
            dislikesCount: 0,
            myStatus: likeStatus.Like,
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
