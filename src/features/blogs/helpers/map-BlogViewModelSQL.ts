import { Injectable } from '@nestjs/common';
import { BlogDbModel, BlogViewModel } from '../models/blogs.models-sql';

@Injectable()
export class MapBlogViewModelSQL {
  getBlogViewModel = (blog: BlogDbModel): BlogViewModel => {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  };
}
