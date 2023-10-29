import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { CommentCreateModel, CommentUpdateModel } from '../comments.models';

@Schema()
class CommentatorInfo {
  @Prop({
    required: true,
  })
  userId: string;
  @Prop({
    required: true,
  })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class Comment {
  _id: mongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  postId: string;
  @Prop({
    required: true,
  })
  content: string;
  @Prop({
    required: true,
    type: CommentatorInfoSchema,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    required: true,
  })
  createdAt: string;

  static createComment(
    dto: CommentCreateModel,
    commentModel: CommentModelType,
  ): CommentDocument {
    const commentInstance = new commentModel();
    commentInstance._id = new mongoose.Types.ObjectId();
    commentInstance.postId = dto.postId;
    commentInstance.content = dto.content;
    commentInstance.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    commentInstance.createdAt = new Date().toISOString();
    return commentInstance;
  }
}
export type CommentModelType = Model<Comment & commentDBMethodsType> &
  CommentModelStaticType;
export const CommentSchema = SchemaFactory.createForClass(Comment);

export type commentDBMethodsType = {
  updateComment: (updateDTO: CommentUpdateModel) => void;
};

CommentSchema.methods = {
  updateComment: function updateComment(updateDTO: CommentUpdateModel): void {
    this.content = updateDTO.content;
  },
};

export type CommentModelStaticType = {
  createComment: (
    dto: CommentCreateModel,
    commentModel: CommentModelType,
  ) => any;
};

const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment,
};

CommentSchema.statics = commentStaticMethods;

export type CommentDocument = HydratedDocument<Comment>;
