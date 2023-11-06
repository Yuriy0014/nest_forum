import { Injectable } from '@nestjs/common';
import {
  Comment,
  commentDBMethodsType,
} from '../models/domain/comments.domain-entities';
import { CommentsRepo } from '../comments.repo';
import { CommentUpdateModel } from '../models/comments.models';
import { HydratedDocument } from 'mongoose';

@Injectable()
export class UpdateCommentUseCase {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async execute(
    commentId: string,
    updateDTO: CommentUpdateModel,
  ): Promise<boolean> {
    const foundComment: HydratedDocument<Comment, commentDBMethodsType> | null =
      await this.commentsRepo.findCommentById(commentId);
    if (!foundComment) {
      return false;
    }
    foundComment.updateComment(updateDTO);
    await this.commentsRepo.save(foundComment);
    return true;
  }
}
