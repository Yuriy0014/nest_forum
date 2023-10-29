import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BlogsQueryRepo } from '../../blogs/blogs.query-repo';
import { BlogViewModel } from '../../blogs/models/blogs.models';
import { JwtService } from '../../../infrastructure/jwt/jwt.service';

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

@Injectable()
export class CheckUserIdGuard implements CanActivate {
  constructor(protected jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return true;
    }

    const token = authHeader.split(' ')[1];

    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(token);
    if (RFTokenInfo) {
      req.userId = RFTokenInfo.userId;
      return true;
    }
    return true;
  }
}
