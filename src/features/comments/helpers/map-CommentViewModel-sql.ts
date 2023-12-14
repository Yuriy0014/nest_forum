import { Injectable } from '@nestjs/common';
import {
  CommentDbModel,
  CommentViewModel,
} from '../models/comments.models-sql';
import { likeStatus } from '../../likes/models/likes.models-sql';
import { LikesQueryRepoSQL } from '../../likes/likes.query-repo-sql';

@Injectable()
export class MapCommentViewModelSQL {
  constructor(private readonly likesQueryRepo: LikesQueryRepoSQL) {}

  async getCommentViewModel(
    comment: CommentDbModel,
    userId?: string | undefined,
  ): Promise<CommentViewModel> {
    const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
      'Comment',
      comment.id,
      userId,
    )) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: likesInfo,
    };
  }
}
