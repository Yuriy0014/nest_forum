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
            .expect(expectedStatusCode);

        let createdQuestion = null;

        if (expectedStatusCode === HttpStatus.CREATED) {
            createdQuestion = response.body;

            expect(createdQuestion).toEqual({
                id: expect.any(String),
                body: data.body,
                correctAnswers: data.correctAnswers
            });
        }

        return { response, createdQuestion: createdQuestion };
    },
};
