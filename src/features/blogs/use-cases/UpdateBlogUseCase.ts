import { BlogsRepoMongo } from '../blogs.repo-mongo';
import { BlogUpdateModel } from '../models/blogs.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(public userId: string, public updateDTO: BlogUpdateModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepoMongo) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const foundBlog = await this.blogsRepo.findBlogById(command.userId);
    if (!foundBlog) return false;

    foundBlog.updateBlog(command.updateDTO);
    await this.blogsRepo.save(foundBlog);
    return true;
  }
}
