import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {QuestionQuizRepoSQL} from "../quizquestions.repo";

export class DeleteQuestionCommand {
    constructor(
        public questionId: string,
    ) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand> {
    constructor(private readonly questionsRepo: QuestionQuizRepoSQL) {}

    async execute(command: DeleteQuestionCommand): Promise<boolean> {
        return this.questionsRepo.deleteQuestion(command.questionId);
    }
}
