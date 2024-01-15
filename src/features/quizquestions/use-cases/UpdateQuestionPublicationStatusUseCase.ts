import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {inputQuestionPublishStatusDTO, QuestionPublishStatusDTO} from "../dto/question.dto";
import {QuestionQuizRepoSQL} from "../quizquestions.repo";
import {HttpStatus} from "@nestjs/common";
import {Result} from "../../helpers/result_types";


export class UpdateQuestionPublicationStatusCommand {
    constructor(
        public questionId: string,
        public updateDTO: inputQuestionPublishStatusDTO) {}
}

@CommandHandler(UpdateQuestionPublicationStatusCommand)
export class UpdateQuestionPublicationStatusUseCase implements ICommandHandler<UpdateQuestionPublicationStatusCommand> {
    constructor(private readonly questionsRepo: QuestionQuizRepoSQL) {}

    async execute(command: UpdateQuestionPublicationStatusCommand): Promise<Result<boolean>> {
        const foundQuestion = await this.questionsRepo.findQuestionById(command.questionId);
        if (!foundQuestion) {
            return {
                resultCode: HttpStatus.NOT_FOUND,
                data: null,
                errorMessage: 'Вопрос с таким id не найден',
            };
        }

        const dto: QuestionPublishStatusDTO = {
            published: command.updateDTO.published,
            updatedAt: new Date()
        }

        const updateResult = await this.questionsRepo.updateQuestionPublishStatus(command.questionId, dto);

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
