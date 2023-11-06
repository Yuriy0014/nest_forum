import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../models/domain/blogs.domain-entities';
import { BlogsRepo } from '../blogs.repo';
import { BlogUpdateModel } from '../models/blogs.models';

@Injectable()
export class UpdateBlogUseCase {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute(userId: string, updateDTO: BlogUpdateModel): Promise<boolean> {
    const foundBlog = await this.blogsRepo.findBlogById(userId);
    if (!foundBlog) return false;

    foundBlog.updateBlog(updateDTO);
    await this.blogsRepo.save(foundBlog);
    return true;
  }
}
