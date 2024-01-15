import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";
import {QuestionCreateDTO} from "./dto/question.dto";
import {v4 as uuidv4} from "uuid";

@Injectable()
export class QuestionQuizRepoSQL {
    private questionRepository: Repository<QuestionEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource) {
        this.questionRepository = dataSource.getRepository(QuestionEntity);
    }

    async createQuestion(createDTO: QuestionCreateDTO) {
        const id = uuidv4();
        try {
            const question = new QuestionEntity();
            question.id = id
            question.body = createDTO.body;
            question.correctAnswers = createDTO.correctAnswers;
            question.published = createDTO.published;
            question.createdAt = createDTO.createdAt;

            await this.questionRepository.save(question);
        } catch (e) {
            console.log(e);
            return null;
        }
        return id;

    }

    async findQuestionById(questionId: string) {
        const question = await this.questionRepository
            .createQueryBuilder("q")
            .select(["q.id", "q.body", "q.correctAnswers", "q.published", "q.createdAt", "q.updatedAt"])
            .where("q.id = :id", {questionId})
            .getOne();

        if (question) {
            return question;
        } else {
            return null;
        }
    }
}