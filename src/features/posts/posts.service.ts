import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepo } from './posts.repo';
import { Post } from './models/domain/posts.domain-entities';
import { PostUpdateModel } from './models/posts.models';
import {
  likesInfoViewModel,
  likeStatusModel,
} from '../likes/models/likes.models';
import { LikeService } from '../likes/likes.service';
import {
  Like,
  LikeObjectTypeEnum,
} from '../likes/models/domain/likes.domain-entities';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    @InjectModel(Like.name)
    private readonly postsRepo: PostsRepo,
    private readonly likesService: LikeService,
  ) {}

  async updatePost(
    postId: string,
    updateDTO: PostUpdateModel,
  ): Promise<boolean> {
    const foundPost = await this.postsRepo.findPostById(postId);
    if (!foundPost) return false;

    foundPost.updatePost(updateDTO);
    await this.postsRepo.save(foundPost);
    return true;
  }

  async deletePost(PostId: string) {
    const foundPost = await this.postsRepo.findPostById(PostId);
    if (!foundPost) return false;
    return this.postsRepo.deletePost(foundPost);
  }

  async likePost(
    postId: string,
    likesInfo: likesInfoViewModel,
    newLikeStatus: likeStatusModel,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    return await this.likesService.likeEntity(
      LikeObjectTypeEnum.Post,
      postId,
      likesInfo,
      newLikeStatus,
      userId,
      userLogin,
    );
  }
}
