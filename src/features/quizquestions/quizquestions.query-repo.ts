import {Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource, Repository} from "typeorm";
import {QuestionEntity} from "./entities/quiz-question.entities";
import {questionFilterModel} from "./helpers/filter";
import {MapQuestionViewModel} from "./helpers/map-QuestionViewModel";

@Injectable()
export class QuestionQuizQueryRepoSQL {
    private questionRepository: Repository<QuestionEntity>;

    constructor(@InjectDataSource() protected dataSource: DataSource,
                private readonly  mapQuestionViewModel: MapQuestionViewModel) {
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

        const body_like =
            queryFilter.bodySearchTerm === null
                ? '%'
                : `%${queryFilter.bodySearchTerm}%`;

        const orderByField = `b.${queryFilter.sortBy}`;
        const orderByDirection = queryFilter.sortDirection;

        const [foundQuestionsDB, totalCount] = await this.dataSource.getRepository(QuestionEntity)
            .createQueryBuilder("q")
            .select(["q.id", "q.body", "q.correctAnswers", "q.published", "q.createdAt", "q.updatedAt"])
            .where("q.name ILIKE :name and q.published = :publStatus", {name: body_like, publStatus: queryFilter.publishedStatus })
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
}