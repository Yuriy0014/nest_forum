import { BlogDbModel, BlogViewModel } from '../models/blogs.models-mongo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MapBlogViewModel {
  getBlogViewModel = (blog: BlogDbModel): BlogViewModel => {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  };
}
