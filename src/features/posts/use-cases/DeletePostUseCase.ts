import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepoSQL } from '../posts.repo-sql';

export class DeletePostCommand {
    constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
    constructor(private readonly postsRepo: PostsRepoSQL) {}

    async execute(command: DeletePostCommand) {
        return this.postsRepo.deletePost(command.postId);
    }
}
