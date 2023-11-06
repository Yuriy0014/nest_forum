import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../models/domain/posts.domain-entities';
import { Like } from '../../likes/models/domain/likes.domain-entities';
import { PostsRepo } from '../posts.repo';
import { PostUpdateModel } from '../models/posts.models';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    @InjectModel(Post.name)
    @InjectModel(Like.name)
    private readonly postsRepo: PostsRepo,
  ) {}

  async execute(postId: string, updateDTO: PostUpdateModel): Promise<boolean> {
    const foundPost = await this.postsRepo.findPostById(postId);
    if (!foundPost) return false;

    foundPost.updatePost(updateDTO);
    await this.postsRepo.save(foundPost);
    return true;
  }
}
