import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserInputModel, UserViewModel } from '../users/models/users.models';
import { LoginInputDTO, reqSessionDTOType } from './models/auth.models';
import { JwtService } from '../../infrastructure/jwt/jwt.service';
import { SessionsService } from './sessions.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post('registration')
  @HttpCode(204)
  async register(@Body() inputModel: UserInputModel): Promise<void> {
    const createdUser = await this.userService.createUser(inputModel, false);
    if (createdUser.data === null) {
      throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDTO: LoginInputDTO,
    @Headers() loginHeaders: any,
    @Ip() IP: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const user: UserViewModel | null = await this.userService.checkCredentials(
      loginDTO,
    );

    if (user) {
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
      const sessionRegInfo = await this.sessionsService.registerSession(
        sessionDTO,
      );
      if (sessionRegInfo === null) {
        throw new HttpException(
          'Не удалось залогиниться. Попроубуйте позднее',
          HttpStatus.UNAUTHORIZED,
        );
      }

      response.cookie('refreshToken', refreshToken);
      return { accessToken: accessToken };
    }
    throw new HttpException(
      'Не удалось залогиниться. Попроубуйте позднее',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
