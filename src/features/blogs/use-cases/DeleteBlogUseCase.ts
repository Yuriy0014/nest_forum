import { Injectable } from '@nestjs/common';
import { BlogsRepo } from '../blogs.repo';

@Injectable()
export class DeleteBlogUseCase {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute(blogId: string) {
    const foundBlog = await this.blogsRepo.findBlogById(blogId);
    if (!foundBlog) return false;
    return this.blogsRepo.deleteBlog(foundBlog);
  }
}
