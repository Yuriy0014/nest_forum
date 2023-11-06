import {
  Comment,
  commentDBMethodsType,
} from '../models/domain/comments.domain-entities';
import { CommentsRepo } from '../comments.repo';
import { CommentUpdateModel } from '../models/comments.models';
import { HydratedDocument } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentCommand {
  constructor(public commentId: string, public updateDTO: CommentUpdateModel) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const foundComment: HydratedDocument<Comment, commentDBMethodsType> | null =
      await this.commentsRepo.findCommentById(command.commentId);
    if (!foundComment) {
      return false;
    }
    foundComment.updateComment(command.updateDTO);
    await this.commentsRepo.save(foundComment);
    return true;
  }
}
