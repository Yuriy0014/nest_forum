import { BlogUpdateModel } from '../models/blogs.models-sql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepoSQL } from '../blogs.repo-sql';

export class UpdateBlogCommand {
    constructor(public blogId: string, public updateDTO: BlogUpdateModel) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
    constructor(private readonly blogsRepo: BlogsRepoSQL) {}

    async execute(command: UpdateBlogCommand): Promise<boolean> {
        const foundBlog = await this.blogsRepo.findBlogById(command.blogId);
        if (!foundBlog) return false;

        return this.blogsRepo.updateBlog(command.blogId, command.updateDTO);
    }
}
