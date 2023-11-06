import { Injectable } from '@nestjs/common';
import { CommentUpdateModel } from './models/comments.models';
import { CommentsRepo } from './comments.repo';
import {
  Comment,
  commentDBMethodsType,
} from './models/domain/comments.domain-entities';
import { HydratedDocument } from 'mongoose';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async updateComment(
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

  async deleteComment(commentId: string): Promise<boolean> {
    const foundComment = await this.commentsRepo.findCommentById(commentId);
    if (!foundComment) return false;
    return this.commentsRepo.deleteComment(foundComment);
  }
}
