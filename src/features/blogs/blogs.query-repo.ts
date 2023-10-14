import { Injectable } from '@nestjs/common';
import { createObjectIdFromSting } from '../../helpers/map-ObjectId';
import { BlogDbModel } from './models/blogs.models';
import { Blog, BlogModelType } from './models/domain/blogs.domain-entities';
import { getBlogViewModel } from '../../helpers/map-BlogViewModel';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}

  async findBlogById(id: string) {
    const _id = createObjectIdFromSting(id);
    if (_id === null) return null;
    const foundBlog: BlogDbModel | null = await this.blogModel
      .findOne({
        _id: _id,
      })
      .lean();
    if (foundBlog) {
      return getBlogViewModel(foundBlog);
    } else {
      return null;
    }
  }
}
