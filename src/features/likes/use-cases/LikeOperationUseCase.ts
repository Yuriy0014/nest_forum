import { Injectable } from '@nestjs/common';
import { LikesRepo } from '../likes.repo';
import { LikeObjectTypeEnum } from '../models/domain/likes.domain-entities';
import {
  likesInfoViewModel,
  likeStatus,
  likeStatusModel,
} from '../models/likes.models';

@Injectable()
export class LikeOperationUseCase {
  constructor(private readonly likesRepo: LikesRepo) {}

  async execute(
    entityType: LikeObjectTypeEnum,
    entityId: string,
    likesInfo: likesInfoViewModel,
    newLikeStatus: likeStatusModel,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const savedLikeStatus = likesInfo.myStatus;
    let result = true;
    if (savedLikeStatus === likeStatus.None) {
      if (newLikeStatus === likeStatus.Like) {
        result = await this.likesRepo.Like(
          entityType,
          entityId,
          userId,
          userLogin,
        );
      }
      if (newLikeStatus === likeStatus.Dislike) {
        result = await this.likesRepo.Dislike(
          entityType,
          entityId,
          userId,
          userLogin,
        );
      }
    }

    if (savedLikeStatus === likeStatus.Like) {
      // По условию домашки, при повторной отправке того-же статуса ничего не меняется
      // if(newLikeStatus === likeStatus.Like) {
      //     await likesRepo.Reset(entityType, req.params.id, req.user!.id,likeStatus.Like)
      // }
      if (newLikeStatus === likeStatus.Dislike) {
        await this.likesRepo.Reset(
          entityType,
          entityId,
          userId,
          userLogin,
          likeStatus.Like,
        );
        result = await this.likesRepo.Dislike(
          entityType,
          entityId,
          userId,
          userLogin,
        );
      }
      if (newLikeStatus === likeStatus.None) {
        result = await this.likesRepo.Reset(
          entityType,
          entityId,
          userId,
          userLogin,
          likeStatus.Like,
        );
      }
    }

    if (savedLikeStatus === likeStatus.Dislike) {
      // По условию домашки, при повторной отправке того-же статуса ничего не меняется
      // if(newLikeStatus === likeStatus.Dislike) {
      //     await likesRepo.Reset(entityType, req.params.id, req.user!.id,likeStatus.Like)
      // }
      if (newLikeStatus === likeStatus.Like) {
        await this.likesRepo.Reset(
          entityType,
          entityId,
          userId,
          userLogin,
          likeStatus.Dislike,
        );
        result = await this.likesRepo.Like(
          entityType,
          entityId,
          userId,
          userLogin,
        );
      }
      if (newLikeStatus === likeStatus.None) {
        result = await this.likesRepo.Reset(
          entityType,
          entityId,
          userId,
          userLogin,
          likeStatus.Dislike,
        );
      }
    }

    return result;
  }
}
