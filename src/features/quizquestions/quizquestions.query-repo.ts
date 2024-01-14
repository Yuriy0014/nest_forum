import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";

@Injectable()
export class QuestionQuizQueryRepoSQL {
    private questionRepository: Repository<QuestionEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
        this.questionRepository = dataSource.getRepository(QuestionEntity);
    }

    async getRandomQuestion(usedQuestionsId: string[] = []){
        try {
            const query = this.questionRepository
                .createQueryBuilder("question")
                .where("question.published = TRUE");

            if (usedQuestionsId.length > 0) {
                query.andWhere("question.id NOT IN (:...ids)", {ids: usedQuestionsId});
            }

            return await query
                .orderBy('RANDOM()') // Функция для случайного выбора в PostgreSQL
                .getOne();
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }

    }

    async checkAnswer(questionId: string, answer: string): Promise<boolean>{
        try{
            const query = this.questionRepository
                .createQueryBuilder("question")
                .where("question.id  = :questionId AND :answer = ANY(question.correctAnswers)", {questionId,answer})
                .getOne()

            return query !== null
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }

    }
}