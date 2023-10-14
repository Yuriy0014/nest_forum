import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { PostCreateModel, PostUpdateModel } from '../posts.models';

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
    dto: PostCreateModel,
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
export const postSchema = SchemaFactory.createForClass(Post);

export type postDBMethodsType = {
  updatePost: (updateDTO: PostUpdateModel) => void;
};

postSchema.methods = {
  updatepost: function updatepost(updateDTO: PostUpdateModel): void {
    this.title = updateDTO.title;
    this.shortDescription = updateDTO.shortDescription;
    this.content = updateDTO.content;
    this.blogId = updateDTO.blogId;
  },
};

export type postModelStaticType = {
  createPost: (
    dto: PostCreateModel,
    blogName: string,
    postModel: postModelType,
  ) => any;
};

const postStaticMethods: postModelStaticType = {
  createPost: Post.createPost,
};

postSchema.statics = postStaticMethods;

export type postDocument = HydratedDocument<Post>;
