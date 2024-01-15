import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";
import {QuestionCreateDTO, QuestionPublishStatusDTO, QuestionUpdateDTO} from "./dto/question.dto";
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

    async deleteQuestion(questionId: string) {
        await this.questionRepository
            .createQueryBuilder()
            .delete()
            .from(QuestionEntity)
            .where("id = :id", {id: questionId})
            .execute();


        const deletedQuestion = await this.questionRepository
            .createQueryBuilder("q")
            .select("q.id")
            .where("q.id = :id", {id: questionId})
            .getOne();


        return deletedQuestion === null;
    }

    async updateQuestion(questionId: string, updateDTO: QuestionUpdateDTO): Promise<boolean> {
        try {
            // Найти существующий вопрос
            const question = await this.questionRepository.findOneBy({id: questionId});

            if (question) {
                // Обновить поля вопросв
                question.body = updateDTO.body;
                question.correctAnswers = updateDTO.correctAnswers;
                question.updatedAt = updateDTO.updatedAt;

                // Сохранить обновленный вопрос
                await this.questionRepository.save(question);
            }
        } catch (e) {
            console.log(e);
            return false;
        }

        const updatedQuestion = await this.questionRepository
            .createQueryBuilder("q")
            .select(["q.id"])
            .where("q.id = :id AND b.updatedAt = :updatedAt AND b.body = :body AND b.correctAnswers = :correctAnswers", {
                id: questionId,
                name: updateDTO.body,
                description: updateDTO.correctAnswers,
                updatedAt: updateDTO.updatedAt
            })
            .getMany();

        return updatedQuestion.length !== 0;
    }

    async updateQuestionPublishStatus(questionId: string, updateDTO: QuestionPublishStatusDTO) {
        try {
            // Найти существующий вопрос
            const question = await this.questionRepository.findOneBy({id: questionId});

            if (question) {
                // Обновить поля вопросв
                question.published = updateDTO.published;
                question.updatedAt = updateDTO.updatedAt;

                // Сохранить обновленный вопрос
                await this.questionRepository.save(question);
            }
        } catch (e) {
            console.log(e);
            return false;
        }

        const updatedQuestion = await this.questionRepository
            .createQueryBuilder("q")
            .select(["q.id"])
            .where("q.id = :id AND b.updatedAt = :updatedAt AND b.published = :published", {
                id: questionId,
                published: updateDTO.published,
                updatedAt: updateDTO.updatedAt
            })
            .getMany();

        return updatedQuestion.length !== 0;
    }
}