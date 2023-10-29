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
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsQueryRepo } from './comments.query-repo';
import { CommentUpdateModel, CommentViewModel } from './models/comments.models';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  likeInputModel,
  likesInfoViewModel,
} from '../likes/models/likes.models';
import { LikesQueryRepo } from '../likes/likes.query-repo';
import { UsersQueryRepo } from '../users/users.query-repo';
import { CheckUserIdGuard } from './guards/comments.guards';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly commentsService: CommentsService,
    private readonly likesQueryRepo: LikesQueryRepo,
    private readonly usersQueryRepo: UsersQueryRepo,
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
  ) {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(commentId);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const result = this.commentsService.updateComment(commentId, updateDTO);
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
    await this.commentsService.deleteComment(commentId);
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

    const likeOperationStatus: boolean = await this.commentsService.likeComment(
      req.params.id,
      likesInfo,
      inputModel.likeStatus,
      req.user.userId,
      foundUser!.login,
    );
    if (!likeOperationStatus) {
      throw new HttpException(
        'Internal server Error. Something went wrong during like operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
