import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  commentDBMethodsType,
  CommentDocument,
  CommentModelType,
} from './models/domain/comments.domain-entities';

@Injectable()
export class CommentsRepoMongo {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
  ) {}

  async findCommentById(
    commentId: string,
  ): Promise<(CommentDocument & commentDBMethodsType) | null> {
    const foundComment = await this.commentModel.findById(commentId);
    if (foundComment) {
      return foundComment;
    } else {
      return null;
    }
  }

  async deleteComment(foundComment: CommentDocument) {
    await foundComment.deleteOne();
    return true;
  }

  async save(instance: CommentDocument): Promise<void> {
    await instance.save();
  }
}
