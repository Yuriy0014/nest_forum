import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {Result} from '../../helpers/result_types';
import {HttpStatus} from "@nestjs/common";
import {inputQuestionCreateDTO, QuestionCreateDTO} from "../dto/question.dto";
import {MapQuestionViewModel} from "../helpers/map-QuestionViewModel";
import {QuestionsViewModel} from "../models/question.model";
import {QuestionQuizRepoSQL} from "../quizquestions.repo";

export class CreateQuestionCommand {
    constructor(public BlogCreateModelDTO: inputQuestionCreateDTO) {
    }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
    constructor(
        private readonly questionRepo: QuestionQuizRepoSQL,
        private readonly mapQuestionViewModel: MapQuestionViewModel,
    ) {
    }

    async execute(command: CreateQuestionCommand): Promise<Result<QuestionsViewModel>> {
        const createDTO: QuestionCreateDTO = {
            body: command.BlogCreateModelDTO.body,
            correctAnswers: command.BlogCreateModelDTO.correctAnswers,
            published: false,
            createdAt: new Date(),
        }

        const questionId = await this.questionRepo.createQuestion(createDTO);
        if (!questionId) {
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при создании вопроса',
            };
        }
        const createdQuestion = await this.questionRepo.findQuestionById(questionId);
        if (!createdQuestion) {
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при получении созданного вопроса',
            };
        }
        return {
            resultCode: HttpStatus.OK,
            data: this.mapQuestionViewModel.getQuestionViewModel(createdQuestion),
        };
    }
}
