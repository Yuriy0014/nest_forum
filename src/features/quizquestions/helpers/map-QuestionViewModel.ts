import {Injectable} from '@nestjs/common';
import {QuestionEntity} from "../entities/quiz-question.entities";
import {QuestionsVewModel} from "../models/question.model";

@Injectable()
export class MapQuestionViewModel {
    getQuestionViewModel = (blog: QuestionEntity): QuestionsVewModel => {
        return {
            id: blog.id,
            body: blog.body,
            correctAnswers: blog.correctAnswers,
            published: blog.published,
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        };
    };
}
