import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {inputQuestionUpdateDTO, QuestionUpdateDTO} from "../dto/question.dto";
import {QuestionQuizRepoSQL} from "../quizquestions.repo";
import {HttpStatus} from "@nestjs/common";
import {Result} from "../../helpers/result_types";


export class UpdateQuestionCommand {
    constructor(
        public questionId: string,
        public updateDTO: inputQuestionUpdateDTO) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
    constructor(private readonly questionsRepo: QuestionQuizRepoSQL) {}

    async execute(command: UpdateQuestionCommand): Promise<Result<boolean>> {
        const foundQuestion = await this.questionsRepo.findQuestionById(command.questionId);
        if (!foundQuestion) {
            return {
                resultCode: HttpStatus.NOT_FOUND,
                data: null,
                errorMessage: 'Вопрос с таким id не найден',
            };
        }

        const dto: QuestionUpdateDTO = {
            body: command.updateDTO.body,
            correctAnswers: command.updateDTO.correctAnswers,
            updatedAt: new Date()
        }

        const updateResult = await this.questionsRepo.updateQuestion(command.questionId, dto);

        if (!updateResult) {
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при обвновлении вопроса',
            };
        }
        return {
            resultCode: HttpStatus.OK,
            data: updateResult,
        };
    }
}
