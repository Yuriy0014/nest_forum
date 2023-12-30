import request from 'supertest';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {HttpStatusType} from './export_data_functions';
import {RouterPaths} from '../../src/helpers/RouterPaths';
import {likeStatus} from '../../src/features/likes/models/likes.models-sql';
import {CommentInputModel} from '../../src/features/comments/models/comments.models-sql';

export const commentTestManager = {
    async createComment(
        app: INestApplication,
        postId: string,
        data: CommentInputModel,
        expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
        headers = {},
    ) {
        const response = await request(app.getHttpServer())
            .post(`${RouterPaths.posts}/${postId}/comments`)
            .set(headers)
            .send(data)
            .expect(expectedStatusCode);

        let createdComment = null;

        if (expectedStatusCode === HttpStatus.CREATED) {
            createdComment = response.body;

            expect(createdComment).toEqual({
                id: expect.any(String),
                content: data.content,
                commentatorInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String),
                },
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: expect.any(Number),
                    dislikesCount: expect.any(Number),
                    myStatus: likeStatus.None,
                },
            });
        }

        return {response, createdComment};
    },
};
