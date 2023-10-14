import { Injectable } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';
import { BlogDbModel } from './models/blogs.models';
import {
  Blog,
  blogDBMethodsType,
  BlogDocument,
  BlogModelType,
} from './models/domain/blogs.domain-entities';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepo {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findBlogById(userId: string) {
    const foundBlog: HydratedDocument<BlogDbModel, blogDBMethodsType> | null =
      await this.blogModel.findById(userId);
    if (foundBlog) {
      return foundBlog;
    } else {
      return null;
    }
  }
}
