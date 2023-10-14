import { ObjectId } from 'mongodb';

export enum likeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type likeStatusModel =
  | likeStatus.None
  | likeStatus.Like
  | likeStatus.Dislike;

export type likeInputModel = {
  likeStatus: likeStatusModel;
};

export type ownerTypeModel = 'Comment' | 'Post';

export class likesDBModel {
  constructor(
    public _id: ObjectId,
    public ownerType: ownerTypeModel,
    public ownerId: string,
    public likesCount: number,
    public dislikesCount: number,
  ) {}
}

export type likesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatusModel;
};

//////////////////////////////////
// Comments for posts collection
//////////////////////////////////

export type extendedLikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatusModel;
  newestLikes: likeDetailsViewModel[];
};

export type likeDetailsViewModel = {
  addedAt: string;
  userId: string;
  login: string;
};

//////////////////////////////////
// usersLikesConnection collection
//////////////////////////////////

export class usersLikesConnectionDBModel {
  constructor(
    public _id: ObjectId,
    public userId: string,
    public userLogin: string,
    public addedAt: Date,
    public likedObjectId: string,
    public likedObjectType: string,
    public status: likeStatusModel,
  ) {}
}
