import { CommentsRepo } from '../comments.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const foundComment = await this.commentsRepo.findCommentById(
      command.commentId,
    );
    if (!foundComment) return false;
    return this.commentsRepo.deleteComment(foundComment);
  }
}
