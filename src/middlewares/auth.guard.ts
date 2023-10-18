import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersQueryRepo } from '../features/users/users.query-repo';
import { UsersRepo } from '../features/users/users.repo';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   // constructor(protected userService: UsersService) {}
//
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     // return validateRequest(request);
//
//     console.log(request.headers.authorization);
//
//     // throw new UnauthorizedException();
//     return false;
//   }
// }

@Injectable()
export class AuthGuardBase implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers['authorization'] !== 'Basic YWRtaW46cXdlcnR5') {
      throw new UnauthorizedException([{ message: 'UnauthorizedException' }]);
    } else {
      return true;
    }
  }
}

@Injectable()
export class ExistingEmailGuard implements CanActivate {
  constructor(protected usersQueryRepo: UsersQueryRepo) {}

  async canActivate(
    context: ExecutionContext,
    // @ts-ignore
  ): boolean | Promise<boolean> | Observable<boolean> {
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

  async canActivate(
    context: ExecutionContext,
    // @ts-ignore
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.body.code) {
      const confirmed = await this.usersRepo.findUserByConfirmationCode(
        req.body.code,
      );

      if (confirmed!.emailConfirmation.isConfirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'login' },
        ]);
      }

      return true;
    }

    if (req.body.email) {
      const confirmed = await this.usersRepo.findByLoginOrEmail(req.body.email);

      if (confirmed?.emailConfirmation.isConfirmed) {
        throw new BadRequestException([
          { message: 'BAD REQUEST', field: 'login' },
        ]);
      }

      return true;
    }
  }
}
