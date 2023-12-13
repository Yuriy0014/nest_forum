import { PostUpdateModel } from '../models/posts.models-sql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepoSQL } from '../posts.repo-sql';

export class UpdatePostComand {
  constructor(
    public blogId: string,
    public postId: string,
    public updateDTO: PostUpdateModel,
  ) {}
}

@CommandHandler(UpdatePostComand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostComand> {
  constructor(private readonly postsRepo: PostsRepoSQL) {}

  async execute(command: UpdatePostComand): Promise<boolean> {
    return this.postsRepo.updatePost(
      command.blogId,
      command.postId,
      command.updateDTO,
    );
  }
}
