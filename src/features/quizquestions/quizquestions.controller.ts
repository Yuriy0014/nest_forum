import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {BasicAuthGuard} from "../auth/guards/basic-auth.guard";
import {queryQuestionsPagination} from "./helpers/filter";
import {QuestionQuizQueryRepoSQL} from "./quizquestions.query-repo";

@UseGuards(BasicAuthGuard)
@Controller('quiz/questions')
export class QuizQuestionsController {
    constructor(
        private readonly  questionsQueryRepo: QuestionQuizQueryRepoSQL
    ) {
    }

    @Get()
    async findAllQuestions(
        @Query()
            query: {
            bodySearchTerm?: string;
            publishedStatus?: string
            sortBy?: string;
            sortDirection?: string;
            pageNumber?: string;
            pageSize?: string;
        }) {
        const queryFilter = queryQuestionsPagination(query);
        const foundQuestions = this.questionsQueryRepo.findAllQuestions(queryFilter)

        return foundQuestions
    }
}
