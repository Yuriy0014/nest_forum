import { Injectable } from '@nestjs/common';
import { PostDBModel, PostViewModel } from '../models/posts.models';
import {
  likeDetailsViewModel,
  likeStatus,
} from '../../likes/models/likes.models';
import { LikesQueryRepo } from '../../likes/likes.query-repo';

@Injectable()
export class MapPostViewModel {
  constructor(protected likesQueryRepo: LikesQueryRepo) {}

  async getPostViewModel(
    post: PostDBModel,
    userId?: string | undefined,
  ): Promise<PostViewModel> {
    const postId = post._id.toString();

    const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
      'Post',
      postId,
      userId,
    )) ?? {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    // const likesLastThreeMongoose = await UsersLikesConnectionModelClass.find({
    //   likedObjectId: postId,
    //   likedObjectType: 'Post',
    //   status: likeStatus.Like,
    // })
    //   .lean()
    //   .sort({ addedAt: 'desc' })
    //   .limit(3);
    //
    // const likesLastThree = likesLastThreeMongoose.map((value) => {
    //   console.log(value);
    //   const newItem: likeDetailsViewModel = {
    //     addedAt: value.addedAt.toString(),
    //     userId: value.userId,
    //     login: value.userLogin,
    //   };
    //   return newItem;
    // });

    return {
      id: postId,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus,
        newestLikes: [],
      },
    };
  }
}
