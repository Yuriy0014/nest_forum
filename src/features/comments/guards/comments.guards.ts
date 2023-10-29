import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '../../../infrastructure/jwt/jwt.service';
import { CommentsRepo } from '../comments.repo';

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

@Injectable()
export class CheckOwnerGuard implements CanActivate {
  constructor(protected commentRepo: CommentsRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const foundComment = await this.commentRepo.findCommentById(req.params.id);
    if (!foundComment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (foundComment.commentatorInfo.userId !== req.params.id) {
      throw new HttpException('Access forbidden', HttpStatus.FORBIDDEN);
    }
    return true;
  }
}
