import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommentsQueryRepo } from './comments.query-repo';
import { CommentViewModel } from './models/comments.models';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsQueryRepo: CommentsQueryRepo) {}

  @Get(':id')
  async findComment(@Param('id') id: string): Promise<CommentViewModel> {
    const foundComment: CommentViewModel | null =
      await this.commentsQueryRepo.findCommentById(id);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundComment;
  }
}
