import { Injectable } from '@nestjs/common';
import { BlogUpdateModel } from './models/blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from './models/domain/blogs.domain-entities';
import { BlogsRepo } from './blogs.repo';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsRepo: BlogsRepo,
  ) {}

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
