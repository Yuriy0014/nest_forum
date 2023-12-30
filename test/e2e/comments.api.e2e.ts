import request from 'supertest';
import {
    PostCreateModelFromBlog,
    PostViewModel,
} from '../../src/features/posts/models/posts.models-sql';
import {
    BlogCreateModel,
    BlogViewModel,
} from '../../src/features/blogs/models/blogs.models-sql';
import {
    UserInputModel,
    UserViewModel,
} from '../../src/features/users/models/users.models.sql';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {RouterPaths} from '../../src/helpers/RouterPaths';
import {blogsTestManager} from '../utils/blogsTestManager';
import {
    authBasicHeader,
    generateString,
} from '../utils/export_data_functions';
import {postsTestManager} from '../utils/postsTestManager';
import {usersTestManager} from '../utils/usersTestManager';
import {
    CommentInputModel,
    CommentUpdateModel,
    CommentViewModel,
} from '../../src/features/comments/models/comments.models-sql';
import {likeStatus} from '../../src/features/likes/models/likes.models-sql';
import {commentTestManager} from '../utils/commentTestManager';
import {JwtService} from '../../src/infrastructure/jwt/jwt.service';
import {createTestAPP} from '../utils/createTestAPP';

describe('/Testing comments', () => {
    let post: PostViewModel;
    let user1: UserViewModel;
    let user2: UserViewModel;
    let blog: BlogViewModel;
    let authJWTHeader1: Record<string, string>;
    let authJWTHeader2: Record<string, string>;
    let app: INestApplication;
    let server: any;
    let jwtService: any;

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

        const {createdBlog} = await blogsTestManager.createBlog(
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
            blogId: blog.id,
        };

        const {createdPost} = await postsTestManager.createPost(
            app,
            dataPost,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        post = createdPost!;

        //Создаем юзера1, чтобы оставлять комменты

        const dataUser: UserInputModel = {
            login: 'User01',
            password: 'Password01',
            email: 'email01@fishmail2dd.com',
        };

        const {createdUser: createdUser1} = await usersTestManager.createUser(
            app,
            dataUser,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        user1 = createdUser1!;

        const AccessToken1 = await jwtService.createJWT(user1);
        authJWTHeader1 = {'Authorization': `Bearer ${AccessToken1}`};

        //Создаем юзера2, чтобы оставлять комменты

        const dataUser2: UserInputModel = {
            login: 'User02',
            password: 'Password02',
            email: 'email02@fishmail3dd.com',
        };

        const {createdUser: createdUser2} = await usersTestManager.createUser(
            app,
            dataUser2,
            HttpStatus.CREATED,
            authBasicHeader,
        );
        user2 = createdUser2!;

        const AccessToken2 = await jwtService.createJWT(user2);
        authJWTHeader2 = {'Authorization': `Bearer ${AccessToken2}`};
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user1).not.toBeNull();
    });

    it('should return 404 for not uuid commentID', async () => {
        await request(server)
            .get(`${RouterPaths.comments}/-22222222220`)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 for not existing comment', async () => {
        await request(server)
            .get(`${RouterPaths.comments}/000e0000-e00b-00d0-a000-000000000000`)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 and empty array', async () => {
        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: [],
            });
    });

    it('should not create comment without AUTH', async () => {
        const data: CommentInputModel = {
            content: 'Absolutely new comment',
        };

        await commentTestManager.createComment(
            app,
            post.id,
            data,
            HttpStatus.UNAUTHORIZED,
        );

        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: [],
            });
    });

    it('should not create comment without content', async () => {
        const data: CommentInputModel = {
            content: '',
        };

        await commentTestManager.createComment(
            app,
            post.id,
            data,
            HttpStatus.BAD_REQUEST,
            authJWTHeader1,
        );

        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: [],
            });
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

        const {createdComment} = await commentTestManager.createComment(
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

        const {createdComment} = await commentTestManager.createComment(
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

    it('should not update comment 1 without AUTH', async () => {
        const data: CommentUpdateModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('should not update comment 1 with AUTH but incorrect body', async () => {
        const data1: CommentUpdateModel = {
            content: 'UPDATED COMMENT 1',
        };

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data1)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send({
                content: generateString(401),
            })
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('should not update comment 2 with AUTH of another user (403)', async () => {
        const data: CommentUpdateModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .send(data)
            .expect(HttpStatus.FORBIDDEN);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('should update comment 1 with correct AUTH', async () => {
        const data: CommentUpdateModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await request(server)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: data.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
        comment_1.content = data.content;
    });

    it('"DELETE/PUT should return 400 if :id from uri param is not uuid format', async () => {
        const data: CommentUpdateModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 222',
        };

        await request(server)
            .put(`${RouterPaths.comments}/-2323232`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .delete(`${RouterPaths.comments}/-2323232`)
            .set(authJWTHeader1)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('"DELETE/PUT should return 404 if :id from uri param not found', async () => {
        const data: CommentUpdateModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 222',
        };

        await request(server)
            .put(`${RouterPaths.comments}/000e0000-e00b-00d0-a000-000000000000`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.NOT_FOUND);

        await request(server)
            .delete(`${RouterPaths.comments}/000e0000-e00b-00d0-a000-000000000000`)
            .set(authJWTHeader1)
            .expect(HttpStatus.NOT_FOUND);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('should not delete comment_1 with AUTH of another user (403)', async () => {
        await request(server)
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .expect(HttpStatus.FORBIDDEN);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK, {
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: comment_1.likesInfo,
            });
    });

    it('should delete comment 1 with correct AUTH and path', async () => {
        await request(server)
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .expect(HttpStatus.NO_CONTENT);

        await request(server)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.NOT_FOUND);

        await request(server)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id: comment_2.id,
                        content: comment_2.content,
                        commentatorInfo: comment_2.commentatorInfo,
                        createdAt: comment_2.createdAt,
                        likesInfo: comment_2.likesInfo,
                    },
                ],
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
