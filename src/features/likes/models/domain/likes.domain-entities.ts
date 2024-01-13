import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { likeStatus } from '../likes.models-mongo';

export enum LikeObjectTypeEnum {
  Comment = 'Comment',
  Post = 'Post',
}

@Schema()
export class Like {
    _id: mongoose.Types.ObjectId;
  @Prop({
      required: true,
      type: String,
      enum: LikeObjectTypeEnum,
  })
      ownerType: LikeObjectTypeEnum;
  @Prop({
      required: true,
  })
      ownerId: string;
  //
  @Prop({
      required: true,
  })
      likesCount: number;
  @Prop({
      required: true,
  })
      dislikesCount: number;

  static createLikesInfo(
      ownerId: string,
      ownerType: LikeObjectTypeEnum,
      likeModel: LikeModelType,
  ): LikeDocument {
      const likesInfoInstance = new likeModel();
      likesInfoInstance._id = new mongoose.Types.ObjectId();
      likesInfoInstance.ownerType = ownerType;
      likesInfoInstance.ownerId = ownerId;
      likesInfoInstance.likesCount = 0;
      likesInfoInstance.dislikesCount = 0;

      return likesInfoInstance;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

export type likeModelStaticType = {
  createLikesInfo: (
    ownerId: string,
    ownerType: LikeObjectTypeEnum,
    likeModel: LikeModelType,
  ) => any;
};

const likeStaticMethods: likeModelStaticType = {
    createLikesInfo: Like.createLikesInfo,
};
LikeSchema.statics = likeStaticMethods;

export type LikeModelType = Model<Like> & likeModelStaticType;

export type LikeDocument = HydratedDocument<Like>;

/////////////////////////////////
///// Connections
/////////////////////////////////

@Schema()
export class UsersLikesConnection {
    _id: mongoose.Types.ObjectId;
  @Prop({
      required: true,
  })
      userId: string;
  //
  @Prop({
      required: true,
  })
      likedObjectId: string;
  @Prop({
      required: true,
  })
      userLogin: string;
  @Prop({
      required: true,
  })
      addedAt: Date;
  @Prop({
      required: true,
      type: String,
      enum: LikeObjectTypeEnum,
  })
      likedObjectType: LikeObjectTypeEnum;
  @Prop({
      required: true,
      type: String,
      enum: likeStatus,
  })
      status: likeStatus;
}
export type UsersLikesConnectionType = Model<UsersLikesConnection>;
export const UsersLikesConnectionSchema =
  SchemaFactory.createForClass(UsersLikesConnection);

export type UsersLikesConnectionDocument =
  HydratedDocument<UsersLikesConnection>;
