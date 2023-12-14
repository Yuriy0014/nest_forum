import { LikeObjectTypeEnum } from '../../likes/models/domain/likes.domain-entities';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepoSQL } from '../../likes/likes.repo-sql';
import { CommentsRepoSQL } from '../comments.repo-sql';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly commentsRepo: CommentsRepoSQL,
    private readonly likesRepo: LikesRepoSQL,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string | null> {
    const createCommentDTO = {
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    };

    const newCommentId: string | null = await this.commentsRepo.createComment(
      createCommentDTO,
    );

    if (!newCommentId) {
      return null;
    }

    const newLikesInfo = await this.likesRepo.createLikesInfo(
      newCommentId,
      LikeObjectTypeEnum.Comment,
    );

    if (!newLikesInfo) {
      return null;
    }

    return newCommentId;
  }
}
