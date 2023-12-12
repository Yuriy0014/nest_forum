import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import {
  PostCreateModelStandart,
  PostUpdateModel,
} from '../posts.models-mongo';

@Schema()
export class Post {
  _id: mongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  title: string;
  @Prop({
    required: true,
  })
  shortDescription: string;
  //
  @Prop({
    required: true,
  })
  content: string;
  @Prop({
    required: true,
  })
  blogId: string;
  @Prop({
    required: true,
  })
  blogName: string;
  @Prop({
    required: true,
  })
  createdAt: string;

  static createPost(
    dto: PostCreateModelStandart,
    blogName: string,
    postModel: postModelType,
  ): postDocument {
    const postInstance = new postModel();
    postInstance._id = new mongoose.Types.ObjectId();
    postInstance.title = dto.title;
    postInstance.shortDescription = dto.shortDescription;
    postInstance.content = dto.content;
    postInstance.blogId = dto.blogId;
    postInstance.blogName = blogName;
    postInstance.createdAt = new Date().toISOString();

    return postInstance;
  }
}
export type postModelType = Model<Post> & postModelStaticType;
export const PostSchema = SchemaFactory.createForClass(Post);

export type postDBMethodsType = {
  updatePost: (updateDTO: PostUpdateModel) => void;
};

PostSchema.methods = {
  updatePost: function updatePost(updateDTO: PostUpdateModel): void {
    this.title = updateDTO.title;
    this.shortDescription = updateDTO.shortDescription;
    this.content = updateDTO.content;
    this.blogId = updateDTO.blogId;
  },
};

export type postModelStaticType = {
  createPost: (
    dto: PostCreateModelStandart,
    blogName: string,
    postModel: postModelType,
  ) => any;
};

const postStaticMethods: postModelStaticType = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;

export type postDocument = HydratedDocument<Post>;
