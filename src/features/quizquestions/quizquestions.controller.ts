import {Body, Controller, Get, HttpException, Post, Query, UseGuards} from '@nestjs/common';
import {BasicAuthGuard} from "../auth/guards/basic-auth.guard";
import {queryQuestionsPagination} from "./helpers/filter";
import {QuestionQuizQueryRepoSQL} from "./quizquestions.query-repo";
import {Result} from "../helpers/result_types";
import {CommandBus} from "@nestjs/cqrs";
import {inputQuestionCreateDTO} from "./dto/question.dto";
import {CreateQuestionCommand} from "./use-cases/CreateQuestionUseCase";
import {QuestionsViewModel} from "./models/question.model";

@UseGuards(BasicAuthGuard)
@Controller('quiz/questions')
export class QuizQuestionsController {
    constructor(
        private readonly questionsQueryRepo: QuestionQuizQueryRepoSQL,
        private commandBus: CommandBus,
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

    @Post()
    async createQuestion(
        @Body() inputModel: inputQuestionCreateDTO,
    ): Promise<QuestionsViewModel> {
        const createdQuestion: Result<QuestionsViewModel> = await this.commandBus.execute(
            new CreateQuestionCommand(inputModel),
        );
        if (createdQuestion.data === null) {
            throw new HttpException(
                createdQuestion.errorMessage!,
                createdQuestion.resultCode,
            );
        }
        return createdQuestion.data;
    }
}
