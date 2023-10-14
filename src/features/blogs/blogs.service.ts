import { Injectable } from '@nestjs/common';
import { BlogCreateModel } from './models/blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './models/domain/blogs.domain-entities';
import { BlogsRepo } from './blogs.repo';
import { getBlogViewModel } from '../../helpers/map-BlogViewModel';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async createBlog(BlogCreateModelDTO: BlogCreateModel) {
    const createdBlog = this.blogModel.createBlog(
      BlogCreateModelDTO,
      this.blogModel,
    );

    await this.blogsRepo.save(createdBlog);
    return getBlogViewModel(createdBlog);
  }
}
