import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BlogsQueryRepo } from '../../blogs/blogs.query-repo';
import { BlogViewModel } from '../../blogs/models/blogs.models';

@Injectable()
export class ExistingBlogGuard implements CanActivate {
  constructor(protected blogsQueryRepo: BlogsQueryRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(req.body.blogId);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}
