import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../models/domain/blogs.domain-entities';
import { BlogsRepo } from '../blogs.repo';

@Injectable()
export class DeleteBlogUseCase {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute(blogId: string) {
    const foundBlog = await this.blogsRepo.findBlogById(blogId);
    if (!foundBlog) return false;
    return this.blogsRepo.deleteBlog(foundBlog);
  }
}
