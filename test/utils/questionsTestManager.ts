import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { HttpStatusType } from './export_data_functions';
import { RouterPaths } from '../../src/helpers/RouterPaths';
import {inputQuestionCreateDTO} from "../../src/features/quizquestions/dto/question.dto";

export const questionsTestManager = {
    async createQuestion(
        app: INestApplication,
        data: inputQuestionCreateDTO,
        expectedStatusCode: HttpStatusType = HttpStatus.CREATED,
        headers = {},
    ) {
        const response = await request(app.getHttpServer())
            .post(RouterPaths.quizquestions)
            .set(headers)
            .send(data)

        // console.log(response.body)
            .expect(expectedStatusCode);

        let createdQuestion = null;

        if (expectedStatusCode === HttpStatus.CREATED) {
            createdQuestion = response.body;

            expect(createdQuestion).toEqual({
                id: expect.any(String),
                body: data.body,
                correctAnswers: data.correctAnswers,
                published: false,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),


            });
        }

        return { response, createdQuestion: createdQuestion };
    },
};
