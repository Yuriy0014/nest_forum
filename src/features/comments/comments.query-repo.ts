import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentModelType,
} from './models/domain/comments.domain-entities';
import { MapCommentViewModel } from './helpers/map-CommentViewModel';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    private readonly mapCommentViewModel: MapCommentViewModel,
  ) {}

  async findCommentById(id: string, userId?: string) {
    const foundComment = await this.commentModel.findById(id);
    if (foundComment) {
      return this.mapCommentViewModel.getCommentViewModel(foundComment, userId);
    } else {
      return null;
    }
  }
}
