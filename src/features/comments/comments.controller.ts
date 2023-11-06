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
import { CommentsQueryRepo } from './comments.query-repo';
import { CommentUpdateModel, CommentViewModel } from './models/comments.models';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  likeInputModel,
  likesInfoViewModel,
} from '../likes/models/likes.models';
import { LikesQueryRepo } from '../likes/likes.query-repo';
import { UsersQueryRepo } from '../users/users.query-repo';
import { CheckUserIdGuard } from './guards/comments.guards';
import { LikeOperationCommand } from '../likes/use-cases/LikeOperationUseCase';
import { LikeObjectTypeEnum } from '../likes/models/domain/likes.domain-entities';
import { UpdateCommentUseCase } from './use-cases/UpdateCommentUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteCommentCommand } from './use-cases/DeleteCommentUseCase';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly likesQueryRepo: LikesQueryRepo,
    private readonly usersQueryRepo: UsersQueryRepo,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
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
    @Param('id') commentId: string,
    @Body() updateDTO: CommentUpdateModel,
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
    const result = this.updateCommentUseCase.execute(commentId, updateDTO);
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
    await this.commandBus.execute(new DeleteCommentCommand(commentId));
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
