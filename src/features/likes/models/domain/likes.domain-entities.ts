import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { likeStatus } from '../likes.models';

enum LikeObjectTypeEnum {
  Comment = 'Comment',
  Like = 'Like',
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
}
export type LikeModelType = Model<Like>;
export const LikeSchema = SchemaFactory.createForClass(Like);

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
