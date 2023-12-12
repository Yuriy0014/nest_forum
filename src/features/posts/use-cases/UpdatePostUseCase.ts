import { PostsRepoMongo } from '../posts.repo-mongo';
import { PostUpdateModel } from '../models/posts.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostComand {
  constructor(public postId: string, public updateDTO: PostUpdateModel) {}
}

@CommandHandler(UpdatePostComand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostComand> {
  constructor(private readonly postsRepo: PostsRepoMongo) {}

  async execute(command: UpdatePostComand): Promise<boolean> {
    const foundPost = await this.postsRepo.findPostById(command.postId);
    if (!foundPost) return false;

    foundPost.updatePost(command.updateDTO);
    await this.postsRepo.save(foundPost);
    return true;
  }
}
