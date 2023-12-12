import { LikesRepoMongo } from '../likes.repo-mongo';
import { LikeObjectTypeEnum } from '../models/domain/likes.domain-entities';
import {
  likesInfoViewModel,
  likeStatus,
  likeStatusModel,
} from '../models/likes.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LikeOperationCommand {
  constructor(
    public entityType: LikeObjectTypeEnum,
    public entityId: string,
    public likesInfo: likesInfoViewModel,
    public newLikeStatus: likeStatusModel,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(LikeOperationCommand)
export class LikeOperationUseCase
  implements ICommandHandler<LikeOperationCommand>
{
  constructor(private readonly likesRepo: LikesRepoMongo) {}

  async execute(command: LikeOperationCommand): Promise<boolean> {
    const savedLikeStatus = command.likesInfo.myStatus;
    let result = true;
    if (savedLikeStatus === likeStatus.None) {
      if (command.newLikeStatus === likeStatus.Like) {
        result = await this.likesRepo.Like(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
        );
      }
      if (command.newLikeStatus === likeStatus.Dislike) {
        result = await this.likesRepo.Dislike(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
        );
      }
    }

    if (savedLikeStatus === likeStatus.Like) {
      // По условию домашки, при повторной отправке того-же статуса ничего не меняется
      // if(newLikeStatus === likeStatus.Like) {
      //     await likesRepo.Reset(entityType, req.params.id, req.user!.id,likeStatus.Like)
      // }
      if (command.newLikeStatus === likeStatus.Dislike) {
        await this.likesRepo.Reset(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
          likeStatus.Like,
        );
        result = await this.likesRepo.Dislike(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
        );
      }
      if (command.newLikeStatus === likeStatus.None) {
        result = await this.likesRepo.Reset(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
          likeStatus.Like,
        );
      }
    }

    if (savedLikeStatus === likeStatus.Dislike) {
      // По условию домашки, при повторной отправке того-же статуса ничего не меняется
      // if(newLikeStatus === likeStatus.Dislike) {
      //     await likesRepo.Reset(entityType, req.params.id, req.user!.id,likeStatus.Like)
      // }
      if (command.newLikeStatus === likeStatus.Like) {
        await this.likesRepo.Reset(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
          likeStatus.Dislike,
        );
        result = await this.likesRepo.Like(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
        );
      }
      if (command.newLikeStatus === likeStatus.None) {
        result = await this.likesRepo.Reset(
          command.entityType,
          command.entityId,
          command.userId,
          command.userLogin,
          likeStatus.Dislike,
        );
      }
    }

    return result;
  }
}
