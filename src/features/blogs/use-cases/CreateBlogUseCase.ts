import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../models/domain/blogs.domain-entities';
import { BlogsRepo } from '../blogs.repo';
import { MapBlogViewModel } from '../helpers/map-BlogViewModel';
import { BlogCreateModel } from '../models/blogs.models';

@Injectable()
export class CreateBlogUseCase {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
    private readonly mapBlogViewModel: MapBlogViewModel,
  ) {}

  async execute(BlogCreateModelDTO: BlogCreateModel) {
    const createdBlog = this.blogModel.createBlog(
      BlogCreateModelDTO,
      this.blogModel,
    );

    await this.blogsRepo.save(createdBlog);
    return this.mapBlogViewModel.getBlogViewModel(createdBlog);
  }
}
