import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";

@Injectable()
export class QuestionQuizQueryRepoSQL {
    private questionRepository: Repository<QuestionEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
        this.questionRepository = dataSource.getRepository(QuestionEntity);
    }
}