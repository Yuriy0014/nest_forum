import {CommentUpdateModel} from '../models/comments.models-mongo';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CommentsRepoSQL} from '../comments.repo-sql';
import {CommentEntity} from "../entities/coments.entities";

export class UpdateCommentCommand {
    constructor(public commentId: string, public updateDTO: CommentUpdateModel) {
    }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
implements ICommandHandler<UpdateCommentCommand> {
    constructor(private readonly commentsRepo: CommentsRepoSQL) {
    }

    async execute(command: UpdateCommentCommand): Promise<boolean> {
        const foundComment: CommentEntity | null =
            await this.commentsRepo.findCommentById(command.commentId);
        if (!foundComment) {
            return false;
        }
        return this.commentsRepo.updateComment(
            command.commentId,
            command.updateDTO,
        );
    }
}
