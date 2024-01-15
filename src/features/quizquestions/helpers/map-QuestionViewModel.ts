import {Injectable} from '@nestjs/common';
import {QuestionEntity} from "../entities/quiz-question.entities";
import {QuestionsViewModel} from "../models/question.model";

@Injectable()
export class MapQuestionViewModelSQL {
    getQuestionViewModel = (question: QuestionEntity): QuestionsViewModel => {

        return {
            id: question.id,
            body: question.body,
            correctAnswers: question.correctAnswers,
            published: question.published,
            createdAt: question.createdAt.toISOString(),
            updatedAt: question.updatedAt === null ? 'null' : question.updatedAt.toISOString()
        };
    };
}
