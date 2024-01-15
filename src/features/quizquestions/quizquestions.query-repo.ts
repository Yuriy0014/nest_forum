import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";
import {questionFilterModel} from "./helpers/filter";
import {MapQuestionViewModelSQL} from "./helpers/map-QuestionViewModel";

@Injectable()
export class QuestionQuizQueryRepoSQL {
    private questionRepository: Repository<QuestionEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource,
                private readonly mapQuestionViewModel: MapQuestionViewModelSQL) {
        this.questionRepository = dataSource.getRepository(QuestionEntity);
    }

    async getRandomQuestion(usedQuestionsId: string[] = []) {
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

    async checkAnswer(questionId: string, answer: string): Promise<boolean> {
        try {
            const query = this.questionRepository
                .createQueryBuilder("question")
                .where("question.id  = :questionId AND :answer = ANY(question.correctAnswers)", {questionId, answer})
                .getOne()

            return query !== null
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException(e);
        }

    }

    async findAllQuestions(queryFilter: questionFilterModel) {

        const validSortFields = [
            'id',
            'body',
            'correctAnswers',
            'published',
            'createdAt',
            'updatedAt',
        ];
        if (!validSortFields.includes(queryFilter.sortBy)) {
            throw new Error('Invalid sort field');
        }

        const body_like = queryFilter.bodySearchTerm ? `%${queryFilter.bodySearchTerm}%` : null;

        const queryBuilder = this.dataSource.getRepository(QuestionEntity)
            .createQueryBuilder("q")
            .select(["q.id", "q.body", "q.correctAnswers", "q.published", "q.createdAt", "q.updatedAt"]);

        // Добавляем условие для body_like, если оно не null
        if (body_like) {
            queryBuilder.andWhere("q.body ILIKE :body_like", {body_like});
        }

        // Добавляем условие на publishedStatus, если оно не 'all'
        if (queryFilter.publishedStatus !== 'all') {
            const publStatus = queryFilter.publishedStatus === 'published';
            queryBuilder.andWhere("q.published = :publStatus", {publStatus});
        }

        const orderByField = `q.${queryFilter.sortBy}`;
        const orderByDirection = queryFilter.sortDirection === 'ASC' ? 'ASC' : 'DESC';

        const [foundQuestionsDB, totalCount] = await queryBuilder
            .orderBy(orderByField, orderByDirection)
            .limit(queryFilter.pageSize)
            .offset(queryFilter.pageSize * (queryFilter.pageNumber - 1))
            .getManyAndCount();

        const foundQuestions = foundQuestionsDB.map((question) =>
            this.mapQuestionViewModel.getQuestionViewModel(question),
        );


        return {
            pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: totalCount,
            items: foundQuestions,
        };


    }

    async findQuestionById(questionId: string) {
        const question = await this.questionRepository
            .createQueryBuilder("q")
            .select(["q.id", "q.body", "q.correctAnswers", "q.published", "q.createdAt", "q.updatedAt"])
            .where("q.id = :questionId", {questionId})
            .getOne();

        if (question) {
            return this.mapQuestionViewModel.getQuestionViewModel(question);
        } else {
            return null;
        }
    }
}