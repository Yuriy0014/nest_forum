import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, postModelType } from '../models/domain/posts.domain-entities';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../../likes/models/domain/likes.domain-entities';
import { PostsRepo } from '../posts.repo';
import { LikesRepo } from '../../likes/likes.repo';
import { BlogsQueryRepo } from '../../blogs/blogs.query-repo';
import { MapPostViewModel } from '../helpers/map-PostViewModel';
import { PostCreateModelStandart } from '../models/posts.models';

@Injectable()
export class CreatePostUseCase {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly postsRepo: PostsRepo,
    private readonly likesRepo: LikesRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly mapPostViewModel: MapPostViewModel,
  ) {}

  async execute(PostCreateModelDTO: PostCreateModelStandart) {
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
}
