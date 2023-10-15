import { Injectable } from '@nestjs/common';
import { BlogCreateModel, BlogUpdateModel } from './models/blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './models/domain/blogs.domain-entities';
import { BlogsRepo } from './blogs.repo';
import { MapBlogViewModel } from './helpers/map-BlogViewModel';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
    private readonly mapBlogViewModel: MapBlogViewModel,
  ) {}

  async createBlog(BlogCreateModelDTO: BlogCreateModel) {
    const createdBlog = this.blogModel.createBlog(
      BlogCreateModelDTO,
      this.blogModel,
    );

    await this.blogsRepo.save(createdBlog);
    return this.mapBlogViewModel.getBlogViewModel(createdBlog);
  }

  async updateBlog(
    userId: string,
    updateDTO: BlogUpdateModel,
  ): Promise<boolean> {
    const foundBlog = await this.blogsRepo.findBlogById(userId);
    if (!foundBlog) return false;

    foundBlog.updateBlog(updateDTO);
    await this.blogsRepo.save(foundBlog);
    return true;
  }

  async deleteBlog(blogId: string) {
    const foundBlog = await this.blogsRepo.findBlogById(blogId);
    if (!foundBlog) return false;
    return this.blogsRepo.deleteBlog(foundBlog);
  }
}
