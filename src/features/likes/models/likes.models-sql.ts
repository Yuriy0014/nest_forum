import {IsEnum, IsNotEmpty, IsString, Matches} from 'class-validator';

export enum likeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
}

export type likeStatusModel =
    | likeStatus.None
    | likeStatus.Like
    | likeStatus.Dislike;

export enum LikeObjectTypeEnum {
    Comment = 'Comment',
    Post = 'Post',
}

export class likeInputModel {
    @IsString()
    @IsNotEmpty()
    @Matches(/.*\S+.*/, {
        message: 'likeStatus should not consist of whitespace characters',
    })
    @IsEnum(likeStatus)
        likeStatus: likeStatusModel;
}

export type ownerTypeModel = 'Comment' | 'Post';

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
