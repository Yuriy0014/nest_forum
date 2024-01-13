import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepoSQL } from '../blogs.repo-sql';

export class DeleteBlogCommand {
    constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
    constructor(private readonly blogsRepo: BlogsRepoSQL) {}

    async execute(command: DeleteBlogCommand): Promise<boolean> {
        return this.blogsRepo.deleteBlog(command.blogId);
    }
}
