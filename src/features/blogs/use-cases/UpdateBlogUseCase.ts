import { BlogsRepo } from '../blogs.repo';
import { BlogUpdateModel } from '../models/blogs.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(public userId: string, public updateDTO: BlogUpdateModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const foundBlog = await this.blogsRepo.findBlogById(command.userId);
    if (!foundBlog) return false;

    foundBlog.updateBlog(command.updateDTO);
    await this.blogsRepo.save(foundBlog);
    return true;
  }
}
