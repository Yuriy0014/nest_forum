import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../models/domain/comments.domain-entities';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../../likes/models/domain/likes.domain-entities';
import { CommentsRepo } from '../comments.repo';
import { LikesRepo } from '../../likes/likes.repo';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly commentsRepo: CommentsRepo,
    private readonly likesRepo: LikesRepo,
  ) {}

  async execute(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentDocument> {
    const createCommentDTO = { postId, content, userId, userLogin };

    const newComment = this.commentModel.createComment(
      createCommentDTO,
      this.commentModel,
    );

    const newLikesInfo = this.likeModel.createLikesInfo(
      newComment._id.toString(),
      LikeObjectTypeEnum.Comment,
      this.likeModel,
    );

    await this.commentsRepo.save(newComment);
    await this.likesRepo.save(newLikesInfo);

    return newComment;
  }
}
