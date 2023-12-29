import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import jwt, {TokenExpiredError} from 'jsonwebtoken';
import {UsersQueryRepoSQL} from '../../users/users.query-repo-sql';
import {UsersRepoSQL} from '../../users/users.repo-sql';
import {SessionsQueryRepoSQL} from '../sessions.query.repo-sql';
import {UserEntity} from "../../users/entities/user.entities";

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
    constructor(protected usersQueryRepo: UsersQueryRepoSQL) {
    }

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
                {message: 'BAD REQUEST', field: 'login'},
            ]);
        }

        if (emailExists) {
            throw new BadRequestException([
                {message: 'BAD REQUEST', field: 'email'},
            ]);
        }
        return true;
    }
}

@Injectable()
export class IsEmailAlreadyConfirmedGuard implements CanActivate {
    constructor(protected usersRepo: UsersRepoSQL) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        if (req.body.code) {
            const confirmed = await this.usersRepo.findUserByConfirmationCode(
                req.body.code,
            );

            if (!confirmed) {
                throw new BadRequestException([
                    {message: 'BAD REQUEST', field: 'code'},
                ]);
            }

            if (confirmed.isEmailConfirmed) {
                console.log('Почта уже подтверждена');
                throw new BadRequestException([
                    {message: 'BAD REQUEST', field: 'code'},
                ]);
            }

            return true;
        }

        if (req.body.email) {
            const confirmed = await this.usersRepo.findByLoginOrEmail(req.body.email);

            if (!confirmed) {
                throw new BadRequestException([
                    {message: 'BAD REQUEST', field: 'email'},
                ]);
            }

            if (confirmed.isEmailConfirmed) {
                throw new BadRequestException([
                    {message: 'BAD REQUEST', field: 'email'},
                ]);
            }
        }
        return true;
    }
}

@Injectable()
export class VerifyRefreshTokenGuard implements CanActivate {
    constructor(protected sessionsQueryRepo: SessionsQueryRepoSQL) {
    }

    private catchTokenError(err: any) {
        if (err instanceof TokenExpiredError) {
            throw new UnauthorizedException([
                {message: 'Unauthorized! Token has expired!', field: 'refreshToken'},
            ]);
        }

        throw new UnauthorizedException([
            {message: 'Unauthorized!', field: 'refreshToken'},
        ]);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const refreshTokenCookie = req.cookies.refreshToken;

        if (!refreshTokenCookie) {
            throw new UnauthorizedException([
                {message: 'UnauthorizedException', field: 'refreshToken'},
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

            req.userId = result.userId;
            return true;
        } catch (e) {
            console.log(e);
            this.catchTokenError(e);
            return false;
        }
    }
}

@Injectable()
export class IsCodeCorrectForPassRecoveryGuard implements CanActivate {
    constructor(protected usersRepo: UsersRepoSQL) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user: UserEntity | null =
            await this.usersRepo.findUserByPassRecoveryCode(req.body.recoveryCode);

        if (req.body.recoveryCode === '' || !user) {
            throw new BadRequestException([
                {
                    message: 'Confirmation code is incorrecttttttttttt',
                    field: 'recoveryCode',
                },
            ]);
        }

        if (!user!.passwordRecoveryCodeActive!) {
            throw new BadRequestException([
                {
                    message: 'Confirmation code has been already used',
                    field: 'recoveryCode',
                },
            ]);
        }

        // Check that the token is up-to-date
        try {
            jwt.verify(req.body.recoveryCode, process.env.JWT_SECRET!);
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                throw new BadRequestException({
                    message: 'Code has expired!',
                    field: 'newPassword',
                });
            }

            throw new BadRequestException({
                message: 'Code is incorrect! Try repeat a bit later',
                field: 'newPassword',
            });
        }
        req.userId = user.id;
        return true;
    }
}
