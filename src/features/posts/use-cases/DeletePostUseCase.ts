import { PostsRepoMongo } from '../posts.repo-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepo: PostsRepoMongo) {}

  async execute(command: DeletePostCommand) {
    const foundPost = await this.postsRepo.findPostById(command.postId);
    if (!foundPost) return false;
    return this.postsRepo.deletePost(foundPost);
  }
}
