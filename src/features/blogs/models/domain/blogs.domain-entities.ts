import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { BlogCreateModel } from '../blogs.models';

@Schema()
export class Blog {
  _id: mongoose.Types.ObjectId;
  @Prop({
    required: true,
  })
  name: string;
  @Prop({
    required: true,
  })
  description: string;
  //
  @Prop({
    required: true,
  })
  websiteUrl: string;
  @Prop({
    required: true,
  })
  createdAt: string;
  @Prop({
    required: true,
  })
  isMembership: boolean;

  static createBlog(
    dto: BlogCreateModel,
    blogModel: BlogModelType,
  ): BlogDocument {
    console.log('BEFOREEEEEEEEEEE');
    const blogInstance = new blogModel();
    console.log('AFTEEEEEEEEEEEEER');
    blogInstance.name = dto.name;
    blogInstance.description = dto.description;
    blogInstance.websiteUrl = dto.websiteUrl;
    blogInstance._id = new mongoose.Types.ObjectId();
    blogInstance.createdAt = new Date().toISOString();
    blogInstance.isMembership = false;

    return blogInstance;
  }
}
export type BlogModelType = Model<Blog> & BlogModelStaticType;
export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: function updateBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): void {
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  },
};

export type BlogModelStaticType = {
  createBlog: (dto: BlogCreateModel, blogModel: BlogModelType) => any;
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;

export type BlogDocument = HydratedDocument<Blog>;
