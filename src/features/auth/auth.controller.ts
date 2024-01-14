import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    Ip,
    NotFoundException,
    Post,
    Request,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import {UserInputModel,} from '../users/models/users.models.mongo';
import {
    ConfirmationCodeInputModel,
    EmailForPasswordRecoveryInputModel,
    EmailResendInputModel,
    LoginInputDTO,
    NewPasswordInputModel,
    reqSessionDTOType,
} from './models/auth.models-sql';
import {JwtService} from '../../infrastructure/jwt/jwt.service';
import {Response} from 'express';
import {
    ExistingEmailGuard,
    IsCodeCorrectForPassRecoveryGuard,
    IsEmailAlreadyConfirmedGuard,
    VerifyRefreshTokenGuard,
} from './guards/auth.guard';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {CommandBus} from '@nestjs/cqrs';
import {CreateUserCommand} from '../users/use-cases/CreateUserUseCase';
import {ConfirmEmailCommand} from './use-cases/ConfirmEmailUseCase';
import {RegisterSessionCommand} from './use-cases/RegisterSessionUseCase';
import {ResendEmailCommand} from './use-cases/ResendEmailUseCase';
import {DeleteSessionCommand} from './use-cases/DeleteSessionUseCase';
import {CheckUserIdGuard} from '../comments/guards/comments.guards';
import {UpdateSessionCommand} from './use-cases/UpdateSessionUseCase';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {RecoveryPasswordCommand} from './use-cases/RecoveryPasswordUseCase';
import {UpdatePasswordCommand} from './use-cases/UpdatePasswordUseCase';
import {ThrottlerGuard} from '@nestjs/throttler';
import {UsersQueryRepoSQL} from '../users/users.query-repo-sql';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersQueryRepo: UsersQueryRepoSQL,
        private readonly commandBus: CommandBus,
    ) {
    }

    @Post('registration')
    @HttpCode(204)
    @UseGuards(ThrottlerGuard, ExistingEmailGuard)
    async register(@Body() inputModel: UserInputModel): Promise<void> {
        const createdUser = await this.commandBus.execute(
            new CreateUserCommand(inputModel, false),
        );
        if (createdUser.data === null) {
            throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('registration-email-resending')
    @HttpCode(204)
    @UseGuards(ThrottlerGuard, IsEmailAlreadyConfirmedGuard)
    async emailResend(@Body() inputModel: EmailResendInputModel): Promise<void> {
        const result = await this.commandBus.execute(
            new ResendEmailCommand(inputModel.email),
        );
        if (!result) {
            throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('registration-confirmation')
    @HttpCode(204)
    @UseGuards(ThrottlerGuard, IsEmailAlreadyConfirmedGuard)
    async confirmRegistration(
        @Body() inputModel: ConfirmationCodeInputModel,
    ): Promise<void> {
        const result = await this.commandBus.execute(
            new ConfirmEmailCommand(inputModel.code),
        );
        if (!result) {
            throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @HttpCode(200)
    async login(
        @Body() loginDTO: LoginInputDTO,
        @Headers() loginHeaders: any,
        @Ip() IP: string,
        @Res({passthrough: true},) response: Response,
        @Request() req: any
    ): Promise<any> {
        const user = req.user

        const accessToken = await this.jwtService.createJWT(user);
        const deviceId = (+new Date()).toString();
        const refreshToken = await this.jwtService.createJWTRefresh(
            user,
            deviceId,
        );

        // Подготавливаем данные для записи в таблицу сессий
        const RFTokenInfo = await this.jwtService.getInfoFromRFToken(
            refreshToken,
        );
        if (RFTokenInfo === null) {
            throw new HttpException('RFToken not provided', HttpStatus.BAD_REQUEST);
        }
        const loginIp = IP || loginHeaders['x-forwarded-for'] || 'IP undefined';
        const deviceName: string =
            loginHeaders['user-agent'] || 'deviceName undefined';

        // Фиксируем сессию
        const sessionDTO: reqSessionDTOType = {
            loginIp: loginIp,
            refreshTokenIssuedAt: RFTokenInfo.iat,
            deviceName: deviceName,
            userId: user.id,
            deviceId,
        };
        const sessionRegInfo = await this.commandBus.execute(
            new RegisterSessionCommand(sessionDTO),
        );
        if (sessionRegInfo === false) {
            throw new HttpException(
                'Не удалось залогиниться. Попроубуйте позднее',
                HttpStatus.UNAUTHORIZED,
            );
        }

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return {accessToken: accessToken};

    }

    @Post('logout')
    @HttpCode(204)
    @UseGuards(CheckUserIdGuard)
    @UseGuards(VerifyRefreshTokenGuard)
    async logout(@Request() req: any): Promise<any> {
        const RFTokenInfo = await this.jwtService.getInfoFromRFToken(
            req.cookies.refreshToken,
        );
        if (RFTokenInfo === null) {
            throw new HttpException(
                'Не удалось вылогиниться. Попроубуйте позднее',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // Удаляем запись с текущей сессией из БД
        const deletionStatus = await this.commandBus.execute(
            new DeleteSessionCommand(RFTokenInfo.iat, req.userId),
        );

        if (!deletionStatus) {
            throw new NotFoundException();
        }
    }

    @Post('refresh-token')
    @HttpCode(200)
    @UseGuards(VerifyRefreshTokenGuard)
    async updateTokens(
        @Headers() loginHeaders: any,
        @Ip() IP: string,
        @Res({passthrough: true}) response: Response,
        @Request() req: any,
    ): Promise<any> {
        const foundUser = await this.usersQueryRepo.findUserById(req.userId);

        if (!foundUser) {
            throw new HttpException(
                'Не удалось залогиниться. Попроубуйте позднее',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const accessTokenNew = await this.jwtService.createJWT(foundUser);

        // Получаем данные о текущем токене
        const CurrentRFTokenInfo = await this.jwtService.getInfoFromRFToken(
            req.cookies.refreshToken,
        );
        if (!CurrentRFTokenInfo) {
            throw new HttpException(
                'Не удалось залогиниться. Попроубуйте позднее',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // Генерируем новый RT
        const refreshTokenNew = await this.jwtService.createJWTRefresh(
            foundUser,
            CurrentRFTokenInfo.deviceId,
        );

        // Подготавливаем данные для записи в таблицу сессий
        const FRTokenInfo = await this.jwtService.getInfoFromRFToken(
            refreshTokenNew,
        );
        if (FRTokenInfo === null) {
            throw new HttpException(
                'Не удалось залогиниться. Попроубуйте позднее',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        const loginIp = IP || loginHeaders['x-forwarded-for'] || 'IP undefined';
        const deviceName: string =
            loginHeaders['user-agent'] || 'deviceName undefined';

        // Обновляем запись в списке сессий
        const sessionRegInfoNew = await this.commandBus.execute(
            new UpdateSessionCommand(
                CurrentRFTokenInfo.iat,
                CurrentRFTokenInfo.deviceId,
                loginIp,
                FRTokenInfo.iat,
                deviceName,
                req.userId,
            ),
        );
        if (!sessionRegInfoNew) {
            throw new HttpException(
                'Не удалось залогиниться. Попроубуйте позднее',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        response.cookie('refreshToken', refreshTokenNew, {
            httpOnly: true,
            secure: true,
        });
        return {accessToken: accessTokenNew};
    }

    @Post('password-recovery')
    @HttpCode(204)
    @UseGuards(ThrottlerGuard)
    async passwordRecovery(
        @Body() inputDTO: EmailForPasswordRecoveryInputModel,
    ): Promise<any> {
        await this.commandBus.execute(new RecoveryPasswordCommand(inputDTO.email));
    }

    @Post('new-password')
    @UseGuards(ThrottlerGuard, IsCodeCorrectForPassRecoveryGuard)
    async newPassword(
        @Body() inputDTO: NewPasswordInputModel,
        @Request() req: any,
    ): Promise<any> {
        await this.commandBus.execute(
            new UpdatePasswordCommand(inputDTO.newPassword, req.userId),
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getInfoAboutMyself(@Request() req: any): Promise<any> {
        const foundUser = await this.usersQueryRepo.findUserById(req.user.userId);

        if (!foundUser) {
            throw new UnauthorizedException();
        }

        return {
            email: foundUser.email,
            login: foundUser.login,
            userId: foundUser.id,
        };
    }
}
