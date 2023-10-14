import { Injectable } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';
import { BlogDbModel } from './models/blogs.models';

@Injectable()
export class BlogsRepo {
  async save(blog: HydratedDocument<BlogDbModel>): Promise<void> {
    await blog.save();
  }
}
