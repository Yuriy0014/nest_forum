import { Injectable } from '@nestjs/common';
import { CommentsRepo } from '../comments.repo';

@Injectable()
export class DeleteCommentUseCase {
  constructor(private readonly commentsRepo: CommentsRepo) {}

  async execute(commentId: string): Promise<boolean> {
    const foundComment = await this.commentsRepo.findCommentById(commentId);
    if (!foundComment) return false;
    return this.commentsRepo.deleteComment(foundComment);
  }
}
