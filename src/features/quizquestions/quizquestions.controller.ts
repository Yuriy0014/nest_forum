import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import {BasicAuthGuard} from "../auth/guards/basic-auth.guard";
import {queryQuestionsPagination} from "./helpers/filter";
import {QuestionQuizQueryRepoSQL} from "./quizquestions.query-repo";
import {Result} from "../helpers/result_types";
import {CommandBus} from "@nestjs/cqrs";
import {inputQuestionCreateDTO, inputQuestionPublishStatusDTO, inputQuestionUpdateDTO} from "./dto/question.dto";
import {CreateQuestionCommand} from "./use-cases/CreateQuestionUseCase";
import {QuestionsViewModel} from "./models/question.model";
import {QuestionQuizRepoSQL} from "./quizquestions.repo";
import {QuestionEntity} from "./entities/quiz-question.entities";
import {DeleteQuestionCommand} from "./use-cases/DeleteQuestionUseCase";
import {UpdateQuestionCommand} from "./use-cases/UpdateQuestionUseCase";
import {UpdateQuestionPublicationStatusCommand} from "./use-cases/UpdateQuestionPublicationStatusUseCase";

@UseGuards(BasicAuthGuard)
@Controller('quiz/questions')
export class QuizQuestionsController {
    constructor(
        private readonly questionsQueryRepo: QuestionQuizQueryRepoSQL,
        private readonly questionsRepo: QuestionQuizRepoSQL,
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

    @Delete(':id')
    @HttpCode(204)
    async deleteQuestion(@Param('id') questionId: string) {
        const foundQuestion: QuestionEntity | null =
            await this.questionsRepo.findQuestionById(questionId);
        if (!foundQuestion) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        const deletionResult = await this.commandBus.execute(
            new DeleteQuestionCommand(questionId),
        );

        if (!deletionResult) {
            throw new HttpException(
                'Не удалось удалить вопрос',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Put(':id')
    @HttpCode(204)
    async updateQuestion(
        @Param('id') questionId: string,
        @Body() updateDTO: inputQuestionUpdateDTO,
    ) {
        const updateResult = await this.commandBus.execute(
            new UpdateQuestionCommand(questionId, updateDTO),
        );

        if (updateResult.data === null) {
            throw new HttpException(
                updateResult.errorMessage!,
                updateResult.resultCode,
            );
        }
    }

    @Put(':id/publish')
    @HttpCode(204)
    async updateQuestionPublicationStatus(
        @Param('id') questionId: string,
        @Body() updateDTO: inputQuestionPublishStatusDTO,
    ) {
        const updateResult = await this.commandBus.execute(
            new UpdateQuestionPublicationStatusCommand(questionId, updateDTO),
        );

        if (updateResult.data === null) {
            throw new HttpException(
                updateResult.errorMessage!,
                updateResult.resultCode,
            );
        }
    }
}
