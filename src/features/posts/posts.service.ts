import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepo } from './posts.repo';
import { Post, postModelType } from './models/domain/posts.domain-entities';
import {
  PostCreateModelStandart,
  PostUpdateModel,
} from './models/posts.models';
import { MapPostViewModel } from './helpers/map-PostViewModel';
import { BlogsQueryRepo } from '../blogs/blogs.query-repo';
import {
  likesInfoViewModel,
  likeStatusModel,
} from '../likes/models/likes.models';
import { LikeService } from '../likes/likes.service';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../likes/models/domain/likes.domain-entities';
import { LikesRepo } from '../likes/likes.repo';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly postsRepo: PostsRepo,
    private readonly likesRepo: LikesRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly mapPostViewModel: MapPostViewModel,
    private readonly likesService: LikeService,
  ) {}

  async createPost(PostCreateModelDTO: PostCreateModelStandart) {
    const blog = await this.blogsQueryRepo.findBlogById(
      PostCreateModelDTO.blogId,
    );

    const createdPost = this.postModel.createPost(
      PostCreateModelDTO,
      blog!.name,
      this.postModel,
    );

    const newLikesInfo = this.likeModel.createLikesInfo(
      createdPost._id.toString(),
      LikeObjectTypeEnum.Post,
      this.likeModel,
    );

    await this.likesRepo.save(newLikesInfo);

    await this.postsRepo.save(createdPost);
    return this.mapPostViewModel.getPostViewModel(createdPost);
  }

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
