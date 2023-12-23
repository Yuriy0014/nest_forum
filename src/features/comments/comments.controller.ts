import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CommentUpdateModel,
  CommentViewModel,
} from './models/comments.models-sql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  likeInputModel,
  LikeObjectTypeEnum,
  likesInfoViewModel,
} from '../likes/models/likes.models-sql';
import { CheckUserIdGuard } from './guards/comments.guards';
import { LikeOperationCommand } from '../likes/use-cases/LikeOperationUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './use-cases/DeleteCommentUseCase';
import { UpdateCommentCommand } from './use-cases/UpdateCommentUseCase';
import { CommentsQueryRepoSQL } from './comments.query-repo-sql';
import { LikesQueryRepoSQL } from '../likes/likes.query-repo-sql';
import { UsersQueryRepoSQL } from '../users/users.query-repo-sql';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepoSQL,
    private readonly likesQueryRepo: LikesQueryRepoSQL,
    private readonly usersQueryRepo: UsersQueryRepoSQL,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  async findComment(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<CommentViewModel> {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(id, req.userId);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundComment;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Body() updateDTO: CommentUpdateModel,
    @Param('id') commentId: string,
    @Request() req: any,
  ) {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(commentId);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (foundComment.commentatorInfo.userId !== req.user.userId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, updateDTO),
    );
    if (!result) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteComment(@Param('id') commentId: string, @Request() req: any) {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(commentId);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (foundComment.commentatorInfo.userId !== req.user.userId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }
    const deletionResult = await this.commandBus.execute(
      new DeleteCommentCommand(commentId),
    );

    if (!deletionResult) {
      throw new HttpException(
        'При удалении коммента произошла ошибочка',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  ////////////////////////////
  // working with likes
  ////////////////////////////

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async sendLikeStatus(
    @Param('id') commentId: string,
    @Body() inputModel: likeInputModel,
    @Request() req: any,
  ) {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(commentId, req.user.userId);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const likesInfo: likesInfoViewModel | null =
      await this.likesQueryRepo.findLikesByOwnerId(
        'Comment',
        commentId,
        req.user.userId,
      );
    if (!likesInfo) {
      throw new HttpException(
        'Internal server Error. Sorry. Unable to get likes info from DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const foundUser = await this.usersQueryRepo.findUserById(req.user.userId);

    const likeOperationStatus: boolean = await this.commandBus.execute(
      new LikeOperationCommand(
        LikeObjectTypeEnum.Comment,
        req.params.id,
        likesInfo,
        inputModel.likeStatus,
        req.user.userId,
        foundUser!.login,
      ),
    );
    if (!likeOperationStatus) {
      throw new HttpException(
        'Internal server Error. Something went wrong during like operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
