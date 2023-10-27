import { Injectable } from '@nestjs/common';
import { CommentUpdateModel } from './models/comments.models';
import { CommentsRepo } from './comments.repo';
import {
  Comment,
  commentDBMethodsType,
  CommentDocument,
  CommentModelType,
} from './models/domain/comments.domain-entities';
import { HydratedDocument } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../likes/models/domain/likes.domain-entities';
import { LikesRepo } from '../likes/likes.repo';
import {
  likesInfoViewModel,
  likeStatusModel,
} from '../likes/models/likes.models';
import { LikeService } from '../likes/likes.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly commentsRepo: CommentsRepo,
    private readonly likesRepo: LikesRepo,
    private readonly likesService: LikeService,
  ) {}

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

  async createComment(
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

  async likeComment(
    commentId: string,
    likesInfo: likesInfoViewModel,
    newLikeStatus: likeStatusModel,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    return await this.likesService.likeEntity(
      LikeObjectTypeEnum.Comment,
      commentId,
      likesInfo,
      newLikeStatus,
      userId,
      userLogin,
    );
  }
}
