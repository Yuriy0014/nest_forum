import {Injectable} from '@nestjs/common';
import {QuestionEntity} from "../entities/quiz-question.entities";
import {QuestionsViewModel} from "../models/question.model";

@Injectable()
export class MapQuestionViewModelSQL {
    getQuestionViewModel = (blog: QuestionEntity): QuestionsViewModel => {
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
