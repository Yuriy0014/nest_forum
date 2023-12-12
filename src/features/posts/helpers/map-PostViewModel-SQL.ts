import { Injectable } from '@nestjs/common';
import { PostDbModel, PostViewModel } from '../models/posts.models-sql';
import {
  likeDetailsViewModel,
  likeStatus,
} from '../../likes/models/likes.models-mongo';
import { LikesQueryRepoMongo } from '../../likes/likes.query-repo-mongo';
import { InjectModel } from '@nestjs/mongoose';
import {
  UsersLikesConnection,
  UsersLikesConnectionType,
} from '../../likes/models/domain/likes.domain-entities';

@Injectable()
export class MapPostViewModelSQL {
  constructor(
    @InjectModel(UsersLikesConnection.name)
    private readonly usersLikesConnectionModel: UsersLikesConnectionType,
    protected likesQueryRepo: LikesQueryRepoMongo,
  ) {}

  async getPostViewModel(
    post: PostDbModel,
    userId?: string | undefined,
  ): Promise<PostViewModel> {
    const postId = post.id;

    const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
      'Post',
      postId,
      userId,
    )) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    const likesLastThreeMongoose = await this.usersLikesConnectionModel
      .find({
        likedObjectId: postId,
        likedObjectType: 'Post',
        status: likeStatus.Like,
      })
      .lean()
      .sort({ addedAt: 'desc' })
      .limit(3);

    const likesLastThree = likesLastThreeMongoose.map((value) => {
      console.log(value);
      const newItem: likeDetailsViewModel = {
        addedAt: value.addedAt.toString(),
        userId: value.userId,
        login: value.userLogin,
      };
      return newItem;
    });

    return {
      id: postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus,
        newestLikes: likesLastThree,
      },
    };
  }
}
