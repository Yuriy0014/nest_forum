import { Injectable } from '@nestjs/common';
import { PostsRepo } from '../posts.repo';
import { PostUpdateModel } from '../models/posts.models';

@Injectable()
export class UpdatePostUseCase {
  constructor(private readonly postsRepo: PostsRepo) {}

  async execute(postId: string, updateDTO: PostUpdateModel): Promise<boolean> {
    const foundPost = await this.postsRepo.findPostById(postId);
    if (!foundPost) return false;

    foundPost.updatePost(updateDTO);
    await this.postsRepo.save(foundPost);
    return true;
  }
}
