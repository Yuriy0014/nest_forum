import { Injectable } from '@nestjs/common';
import { LikesQueryRepo } from '../../likes/likes.query-repo';
import { CommentDbModel, CommentViewModel } from '../models/comments.models';
import { likeStatus } from '../../likes/models/likes.models';

@Injectable()
export class MapCommentViewModel {
  constructor(private readonly likesQueryRepo: LikesQueryRepo) {}

  async getCommentViewModel(
    comment: CommentDbModel,
    userId?: string | undefined,
  ): Promise<CommentViewModel> {
    const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
      'Comment',
      comment._id.toString(),
      userId,
    )) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: likesInfo,
    };
  }
}