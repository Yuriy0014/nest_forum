import { BlogsRepo } from '../blogs.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: DeleteBlogCommand) {
    const foundBlog = await this.blogsRepo.findBlogById(command.blogId);
    if (!foundBlog) return false;
    return this.blogsRepo.deleteBlog(foundBlog);
  }
}
