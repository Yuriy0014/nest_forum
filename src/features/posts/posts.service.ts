import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepo } from './posts.repo';
import { Post, postModelType } from './models/domain/posts.domain-entities';
import { PostCreateModel, PostUpdateModel } from './models/posts.models';
import { MapPostViewModel } from './helpers/map-PostViewModel';
import { BlogsQueryRepo } from '../blogs/blogs.query-repo';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly mapPostViewModel: MapPostViewModel,
  ) {}

  async createPost(PostCreateModelDTO: PostCreateModel) {
    const blog = await this.blogsQueryRepo.findBlogById(
      PostCreateModelDTO.blogId,
    );

    const createdPost = this.postModel.createPost(
      PostCreateModelDTO,
      blog!.name,
      this.postModel,
    );

    await this.postsRepo.save(createdPost);
    return this.mapPostViewModel.getPostViewModel(createdPost);
  }

  async updatePost(
    userId: string,
    updateDTO: PostUpdateModel,
  ): Promise<boolean> {
    const foundPost = await this.postsRepo.findPostById(userId);
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
}