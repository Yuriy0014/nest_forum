import request from 'supertest';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {RouterPaths} from '../../src/helpers/RouterPaths';
import {authBasicHeader, generateString} from '../utils/export_data_functions';
import {createTestAPP} from '../utils/createTestAPP';
import {
    inputQuestionCreateDTO,
    inputQuestionPublishStatusDTO,
    inputQuestionUpdateDTO
} from "../../src/features/quizquestions/dto/question.dto";
import {questionsTestManager} from "../utils/questionsTestManager";
import {QuestionEntity} from "../../src/features/quizquestions/entities/quiz-question.entities";

describe('/Testing quiz questions', () => {
    let app: INestApplication;
    let server: any;

    beforeAll(async () => {
        app = await createTestAPP();
        server = app.getHttpServer();
    });

    it('Delete all data before tests', async () => {
        await request(server)
            .delete(`${RouterPaths.testing}/all-data`)
            .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 404 and empty array', async () => {
        await request(server)
            .get(RouterPaths.quizquestions).set(authBasicHeader)
            .expect(HttpStatus.OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: [],
            });
    });

    it('should not create question without AUTH', async () => {
        const data: inputQuestionCreateDTO = {
            body: 'Кто проживает на дне океана ?',
            correctAnswers: ['Спанч Боб', 'Патрик', 'Сквидвард', 'Мистер Крабс'],
        };

        await questionsTestManager.createQuestion(app, data, HttpStatus.UNAUTHORIZED);

        await request(server).get(RouterPaths.quizquestions).set(authBasicHeader).expect(HttpStatus.OK, {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: [],
        });
    });

    /*
   * Created variable outside the next test to have option use
   * id of created question in the further put test
   * */
    let createdQuestion1: QuestionEntity = {
        id: '',
        body: '',
        correctAnswers: [],
        published: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
    };

    it('should create question with AUTH and correct input data', async () => {
        const data: inputQuestionCreateDTO = {
            body: 'Кто проживает на дне океана ?',
            correctAnswers: ['Спанч Боб', 'Патрик', 'Сквидвард', 'Мистер Крабс'],
        };

        const {createdQuestion} = await questionsTestManager.createQuestion(
            app,
            data,
            HttpStatus.CREATED,
            authBasicHeader,
        );

        createdQuestion1 = createdQuestion!;

        await request(server)
            .get(RouterPaths.quizquestions).set(authBasicHeader)
            .expect(HttpStatus.OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id: createdQuestion1.id,
                        body: createdQuestion1.body,
                        correctAnswers: createdQuestion1.correctAnswers,
                        published: createdQuestion1.published,
                        createdAt: createdQuestion1.createdAt,
                        updatedAt: createdQuestion1.updatedAt,
                    },
                ],
            });
    });

    let createdQuestion2: QuestionEntity = {
        id: '',
        body: '',
        correctAnswers: [],
        published: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
    };

    it('should create one more question with AUTH and correct input data', async () => {
        const data: inputQuestionCreateDTO = {
            body: 'Кто дружит с осликом Иа ?',
            correctAnswers: ['Пятачок', 'Винни Пух', 'Тигра', 'Сова'],
        };

        const {createdQuestion} = await questionsTestManager.createQuestion(
            app,
            data,
            HttpStatus.CREATED,
            authBasicHeader,
        );

        createdQuestion2 = createdQuestion!;

        await request(server)
            .get(RouterPaths.quizquestions).set(authBasicHeader)
            .expect(HttpStatus.OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [
                    {
                        id: createdQuestion2.id,
                        body: createdQuestion2.body,
                        correctAnswers: createdQuestion2.correctAnswers,
                        published: createdQuestion2.published,
                        createdAt: createdQuestion2.createdAt,
                        updatedAt: createdQuestion2.updatedAt,
                    },
                    {
                        id: createdQuestion1.id,
                        body: createdQuestion1.body,
                        correctAnswers: createdQuestion1.correctAnswers,
                        published: createdQuestion1.published,
                        createdAt: createdQuestion1.createdAt,
                        updatedAt: createdQuestion1.updatedAt,
                    },
                ],
            });
    });

    it('should not update question publish status with AUTH and incorrect input data', async () => {

        const data1 = {
            published: 'true'
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}/publish`)
            .set(authBasicHeader)
            .send(data1)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });

        const data2 = {
            published: 1
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data2)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });
    });

    it('should not update question publish status without AUTH and correct input data', async () => {
        const data: inputQuestionPublishStatusDTO = {
            published: true
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}/publish`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, createdQuestion1);
    });

    it('should update question publish status with AUTH and correct input data', async () => {
        const data: inputQuestionPublishStatusDTO = {
            published: true
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}/publish`)
            .set(authBasicHeader)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);

        createdQuestion1.published = data.published


        const response1 = await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.id).toEqual(createdQuestion1.id);
                expect(response.body.body).toEqual(createdQuestion1.body);
                expect(response.body.correctAnswers).toEqual(createdQuestion1.correctAnswers);
                expect(response.body.published).toEqual(createdQuestion1.published);
                expect(response.body.createdAt).toEqual(createdQuestion1.createdAt);
                expect(response.body.updatedAt).toEqual(expect.any(String));
            });

        createdQuestion1.updatedAt = response1.body.updatedAt
    });

    it('should not update question with AUTH and incorrect input data', async () => {

        const data1= {
            body: 'Есть ли жизнь на Марсе ?',
            correctAnswers: 'ДА',
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data1)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });

        const data2= {
            body: 228,
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data2)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });

        const data3= {
            body: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
            correctAnswers: 'Есть ли жизнь на Марсе ?',
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data3)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });

        const data4= {
            body: 'less10?',
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data4)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });

        const data5= {
            body: generateString(501),
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data5)
            .expect(HttpStatus.BAD_REQUEST);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, {
                id: createdQuestion1.id,
                body: createdQuestion1.body,
                correctAnswers: createdQuestion1.correctAnswers,
                published: createdQuestion1.published,
                createdAt: createdQuestion1.createdAt,
                updatedAt: createdQuestion1.updatedAt,
            });


    });

    it('should update question with AUTH and correct input data', async () => {
        const data: inputQuestionUpdateDTO = {
            body: 'Есть ли жизнь на Марсе ?',
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .send(data)
            .expect(HttpStatus.NO_CONTENT);

        createdQuestion1.body = data.body;
        createdQuestion1.correctAnswers = data.correctAnswers;

        const response1 = await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.id).toEqual(createdQuestion1.id);
                expect(response.body.body).toEqual(createdQuestion1.body);
                expect(response.body.correctAnswers).toEqual(createdQuestion1.correctAnswers);
                expect(response.body.published).toEqual(createdQuestion1.published);
                expect(response.body.createdAt).toEqual(createdQuestion1.createdAt);
                expect(response.body.updatedAt).toEqual(expect.any(String));
            });

        createdQuestion1.updatedAt = response1.body.updatedAt

    });

    it('should not update question without AUTH and correct input data', async () => {
        const data: inputQuestionUpdateDTO = {
            body: 'Есть ли жизнь на Марсе ?',
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED);

        await request(server)
            .get(`${RouterPaths.quizquestions}/${createdQuestion1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.OK, createdQuestion1);
    });

    it('should not update question with AUTH and nonexistent id ', async () => {
        const data: inputQuestionUpdateDTO = {
            body: 'Есть ли жизнь на Марсе ?',
            correctAnswers: ['ДА', 'Не знаю', 'Кто спрашивает ?'],
        };

        await request(server)
            .put(`${RouterPaths.quizquestions}/000e0000-e00b-00d0-a000-000000000000`)
            .set(authBasicHeader)
            .send(data)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('DELETE should return 400 for not questionID not uuid', async () => {
        await request(server)
            .delete(`${RouterPaths.quizquestions}/-22222222220`)
            .set(authBasicHeader)
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('DELETE should return 404 for not existing question', async () => {
        await request(server)
            .delete(`${RouterPaths.quizquestions}/000e0000-e00b-00d0-a000-000000000000`)
            .set(authBasicHeader)
            .expect(HttpStatus.NOT_FOUND);
    });

    it('DELETE should return 401 for not questionID not uuid', async () => {
        await request(server)
            .delete(`${RouterPaths.quizquestions}/${createdQuestion2.id}`)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('DELETE should delete second question', async () => {
        await request(server)
            .delete(`${RouterPaths.quizquestions}/${createdQuestion2.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.NO_CONTENT);

        await request(server)
            .delete(`${RouterPaths.quizquestions}/${createdQuestion2.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.NOT_FOUND);
    });

    afterAll(async () => {
        await app.close();
    });
});
