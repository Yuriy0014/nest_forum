import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BlogsQueryRepoSQL } from '../blogs.query-repo-sql';
import { BlogViewModel } from '../models/blogs.models-sql';

@Injectable()
export class ExistingBlogGuard implements CanActivate {
  constructor(private readonly blogsQueryRepo: BlogsQueryRepoSQL) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const currentBlogId = req.params.blogId;

    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(currentBlogId);
    if (!foundBlog) {
      return false;
    }
    return true;
  }
}
