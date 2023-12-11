import { BlogsRepoMongo } from '../blogs.repo-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepoMongo) {}

  async execute(command: DeleteBlogCommand) {
    const foundBlog = await this.blogsRepo.findBlogById(command.blogId);
    if (!foundBlog) return false;
    return this.blogsRepo.deleteBlog(foundBlog);
  }
}
