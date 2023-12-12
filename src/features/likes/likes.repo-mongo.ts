import { Injectable } from '@nestjs/common';
import {
  Like,
  LikeDocument,
  LikeModelType,
  LikeObjectTypeEnum,
  UsersLikesConnection,
  UsersLikesConnectionType,
} from './models/domain/likes.domain-entities';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { likeStatus } from './models/likes.models-mongo';

@Injectable()
export class LikesRepoMongo {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    @InjectModel(UsersLikesConnection.name)
    private readonly usersLikesConnectionModel: UsersLikesConnectionType,
  ) {}

  async Like(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const likesIfoInstance = await this.likeModel.findOne({
      ownerType: ownerType,
      ownerId: ownerId,
    });
    if (!likesIfoInstance) return false;

    likesIfoInstance.likesCount += 1;

    await likesIfoInstance.save();

    let userStatusInstance = await this.usersLikesConnectionModel.findOne({
      userId: userId,
      likedObjectId: ownerId,
      likedObjectType: ownerType,
    });

    if (!userStatusInstance) {
      userStatusInstance = new this.usersLikesConnectionModel();
      userStatusInstance._id = new mongoose.Types.ObjectId();
      userStatusInstance.userId = userId;
      userStatusInstance.likedObjectId = ownerId;
      userStatusInstance.likedObjectType = ownerType;
      userStatusInstance.userLogin = userLogin;
      userStatusInstance.addedAt = new Date();
    }

    userStatusInstance.status = likeStatus.Like;

    await userStatusInstance.save();

    return true;
  }

  async Dislike(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const likesIfoInstance = await this.likeModel.findOne({
      ownerType: ownerType,
      ownerId: ownerId,
    });
    if (!likesIfoInstance) return false;

    likesIfoInstance.dislikesCount += 1;

    await likesIfoInstance.save();

    let userStatusInstance = await this.usersLikesConnectionModel.findOne({
      userId: userId,
      likedObjectId: ownerId,
      likedObjectType: ownerType,
    });

    if (!userStatusInstance) {
      userStatusInstance = new this.usersLikesConnectionModel();
      userStatusInstance._id = new mongoose.Types.ObjectId();
      userStatusInstance.userId = userId;
      userStatusInstance.likedObjectId = ownerId;
      userStatusInstance.likedObjectType = ownerType;
      userStatusInstance.userLogin = userLogin;
      userStatusInstance.addedAt = new Date();
    }
    userStatusInstance.status = likeStatus.Dislike;

    await userStatusInstance.save();

    return true;
  }

  async Reset(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
    savedStatus: string,
  ): Promise<boolean> {
    const likesIfoInstance = await this.likeModel.findOne({
      ownerType: ownerType,
      ownerId: ownerId,
    });
    if (!likesIfoInstance) return false;

    if (savedStatus === likeStatus.Like) {
      likesIfoInstance.likesCount -= 1;
    }
    if (savedStatus === likeStatus.Dislike) {
      likesIfoInstance.dislikesCount -= 1;
    }

    await likesIfoInstance.save();

    let userStatusInstance = await this.usersLikesConnectionModel.findOne({
      userId: userId,
      likedObjectId: ownerId,
      likedObjectType: ownerType,
    });

    if (!userStatusInstance) {
      userStatusInstance = new this.usersLikesConnectionModel();
      userStatusInstance._id = new mongoose.Types.ObjectId();
      userStatusInstance.userId = userId;
      userStatusInstance.likedObjectId = ownerId;
      userStatusInstance.likedObjectType = ownerType;
      userStatusInstance.userLogin = userLogin;
      userStatusInstance.addedAt = new Date();
    }
    userStatusInstance.status = likeStatus.None;

    await userStatusInstance.save();

    return true;
  }

  async save(instance: LikeDocument): Promise<void> {
    await instance.save();
  }
}
