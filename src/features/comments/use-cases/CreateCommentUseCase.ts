import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../models/domain/comments.domain-entities';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../../likes/models/domain/likes.domain-entities';
import { CommentsRepo } from '../comments.repo';
import { LikesRepo } from '../../likes/likes.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly commentsRepo: CommentsRepo,
    private readonly likesRepo: LikesRepo,
  ) {}

  async execute(command: CreateCommentCommand): Promise<CommentDocument> {
    const createCommentDTO = {
      postId: command.postId,
      content: command.content,
      userId: command.userId,
      userLogin: command.userLogin,
    };

    const newComment = this.commentModel.createComment(
      createCommentDTO,
      this.commentModel,
    );

    const newLikesInfo = this.likeModel.createLikesInfo(
      newComment._id.toString(),
      LikeObjectTypeEnum.Comment,
      this.likeModel,
    );

    await this.commentsRepo.save(newComment);
    await this.likesRepo.save(newLikesInfo);

    return newComment;
  }
}
