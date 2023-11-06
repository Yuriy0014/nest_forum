import { Injectable } from '@nestjs/common';
import { CommentsRepo } from './comments.repo';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async deleteComment(commentId: string): Promise<boolean> {
    const foundComment = await this.commentsRepo.findCommentById(commentId);
    if (!foundComment) return false;
    return this.commentsRepo.deleteComment(foundComment);
  }
}
