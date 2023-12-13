import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException([
        { message: 'There is no blog with such id', field: 'blogId' },
      ]);
    }
    return true;
  }
}
