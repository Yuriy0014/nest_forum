import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

@Schema()
export class Blog {
  _id: mongoose.Schema.Types.ObjectId;
  @Prop({
    required: true,
  })
  description: string;
  //
  @Prop({
    required: true,
  })
  websiteUrl: number;
  @Prop({
    required: true,
  })
  createdAt: number;
  @Prop({
    required: true,
  })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
export const BlogModelType = Model<Blog>;

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
