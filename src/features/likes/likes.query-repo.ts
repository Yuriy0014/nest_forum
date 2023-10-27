import {
  likesInfoViewModel,
  likeStatus,
  ownerTypeModel,
  usersLikesConnectionDBModel,
} from './models/likes.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Like,
  LikeModelType,
  UsersLikesConnection,
  UsersLikesConnectionType,
} from './models/domain/likes.domain-entities';
import { MapLikeViewModel } from './helpers/map-likesViewModel';

@Injectable()
export class LikesQueryRepo {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    @InjectModel(UsersLikesConnection.name)
    private readonly usersLikesConnectionModel: UsersLikesConnectionType,
    private readonly mapCommentViewModel: MapLikeViewModel,
  ) {}

  async findLikesByOwnerId(
    ownerType: ownerTypeModel,
    ownerId: string,
    userId: string | undefined = undefined,
  ): Promise<likesInfoViewModel | null> {
    const foundLikes: Like | null = await this.likeModel
      .findOne({
        ownerType: ownerType,
        ownerId: ownerId,
      })
      .lean();

    if (!foundLikes) return null;

    // Пустой ID это тот случай, когда user не авторизован
    let foundStatus:
      | usersLikesConnectionDBModel
      | null
      | { status: likeStatus.None };
    if (userId === undefined) {
      foundStatus = {
        status: likeStatus.None,
      };

      return this.mapCommentViewModel.getLikesInfoViewModel(
        foundLikes,
        foundStatus,
      );
    }

    foundStatus = await this.usersLikesConnectionModel
      .findOne({
        userId: userId,
        likedObjectId: ownerId,
        likedObjectType: ownerType,
      })
      .lean();

    if (!foundStatus) {
      foundStatus = {
        status: likeStatus.None,
      };
    }

    return this.mapCommentViewModel.getLikesInfoViewModel(
      foundLikes,
      foundStatus,
    );
  }
}
