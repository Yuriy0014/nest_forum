import { Injectable } from '@nestjs/common';
import { PostsRepo } from '../posts.repo';

@Injectable()
export class DeletePostUseCase {
  constructor(private readonly postsRepo: PostsRepo) {}

  async execute(PostId: string) {
    const foundPost = await this.postsRepo.findPostById(PostId);
    if (!foundPost) return false;
    return this.postsRepo.deletePost(foundPost);
  }
}
