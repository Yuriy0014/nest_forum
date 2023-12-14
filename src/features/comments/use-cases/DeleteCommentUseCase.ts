import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepoSQL } from '../comments.repo-sql';

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepo: CommentsRepoSQL) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    return this.commentsRepo.deleteComment(command.commentId);
  }
}
