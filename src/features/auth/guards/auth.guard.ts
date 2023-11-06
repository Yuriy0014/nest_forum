import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepo } from '../../users/users.query-repo';
import { UsersRepo } from '../../users/users.repo';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { SessionsQueryRepo } from '../sessions.query.repo';

// @Injectable()
// export class AuthGuardBase implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     if (request.headers['authorization'] !== 'Basic YWRtaW46cXdlcnR5') {
//       throw new UnauthorizedException([{ message: 'UnauthorizedException' }]);
//     } else {
//       return true;
//     }
//   }
// }

@Injectable()
export class ExistingEmailGuard implements CanActivate {
  constructor(protected usersQueryRepo: UsersQueryRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const loginExists = await this.usersQueryRepo.findByLoginOrEmail(
      req.body.login,
    );
    const emailExists = await this.usersQueryRepo.findByLoginOrEmail(
      req.body.email,
    );

    if (loginExists) {
      throw new BadRequestException([
        { message: 'BAD REQUEST', field: 'login' },
      ]);
    }

    if (emailExists) {
      throw new BadRequestException([
        { message: 'BAD REQUEST', field: 'email' },
      ]);
    }
    return true;
  }
}

@Injectable()
export class IsEmailAlreadyConfirmedGuard implements CanActivate {
  constructor(protected usersRepo: UsersRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.body.code) {
      const confirmed = await this.usersRepo.findUserByConfirmationCode(
        req.body.code,
      );

      if (!confirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'code' },
        ]);
      }

      if (confirmed.emailConfirmation.isConfirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'code' },
        ]);
      }

      return true;
    }

    if (req.body.email) {
      const confirmed = await this.usersRepo.findByLoginOrEmail(req.body.email);

      if (!confirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'email' },
        ]);
      }

      if (confirmed.emailConfirmation.isConfirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'email' },
        ]);
      }
    }
    return true;
  }
}

@Injectable()
export class VerifyRefreshTokenGuard implements CanActivate {
  constructor(
    protected usersQueryRepo: UsersQueryRepo,
    protected sessionsQueryRepo: SessionsQueryRepo,
  ) {}

  private catchTokenError(err: any) {
    if (err instanceof TokenExpiredError) {
      throw new UnauthorizedException([
        { message: 'Unauthorized! Token has expired!', field: 'refreshToken' },
      ]);
    }

    throw new UnauthorizedException([
      { message: 'Unauthorized!', field: 'refreshToken' },
    ]);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      throw new UnauthorizedException([
        { message: 'UnauthorizedException', field: 'refreshToken' },
      ]);
    }
    try {
      const result: any = jwt.verify(
        refreshTokenCookie,
        process.env.JWT_SECRET!,
      );

      // Проверяем наличие RFToken в базе активных сессий
      const deviceId: string = result.deviceId;
      const RFTIAT = result.iat * 1000;
      const isActive = await this.sessionsQueryRepo.findSessionWithRFToken(
        RFTIAT,
        deviceId,
      );
      if (!isActive) {
        throw new UnauthorizedException([
          {
            message: 'Unauthorized! В БД с сессиями нет такой записи',
            field: 'refreshToken',
          },
        ]);
      }

      req.user = await this.usersQueryRepo.findUserById(result.userId);
      return true;
    } catch (e) {
      this.catchTokenError(e);
      return false;
    }
  }
}
