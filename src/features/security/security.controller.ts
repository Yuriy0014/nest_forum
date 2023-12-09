import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '../../infrastructure/jwt/jwt.service';
import { VerifyRefreshTokenGuard } from '../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllSessionsCommand } from './use-cases/DeleteAllSessionsUseCase';
import { DeleteDeviceSessionCommand } from './use-cases/DeleteDeviceSessionsUseCase';
import { SessionsQueryRepoSQL } from '../auth/sessions.query.repo-sql';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsQueryRepo: SessionsQueryRepoSQL,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(VerifyRefreshTokenGuard)
  async findAllSessions(@Request() req: any) {
    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(
      req.cookies.refreshToken,
    );
    if (RFTokenInfo === null) {
      throw new UnauthorizedException();
    }
    return await this.sessionsQueryRepo.FindAllSessions(RFTokenInfo.userId);
  }

  @Delete('devices')
  @HttpCode(204)
  @UseGuards(VerifyRefreshTokenGuard)
  async terminateAllSessions(@Request() req: any) {
    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(
      req.cookies.refreshToken,
    );
    if (RFTokenInfo === null) {
      throw new UnauthorizedException();
    }

    const status = await this.commandBus.execute(
      new DeleteAllSessionsCommand(
        RFTokenInfo.iat,
        RFTokenInfo.deviceId,
        RFTokenInfo.userId,
      ),
    );

    if (!status) {
      throw new HttpException(
        'При попытке отключения сессий произошла ошибка. Попробуй еще раз',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('devices/:deviceId')
  @HttpCode(204)
  @UseGuards(VerifyRefreshTokenGuard)
  async terminateDeviceSessions(
    @Request() req: any,
    @Param('deviceId') id: string,
  ) {
    const RFTokenInfo = await this.jwtService.getInfoFromRFToken(
      req.cookies.refreshToken,
    );
    if (RFTokenInfo === null) {
      throw new UnauthorizedException();
    }

    const ownerOfDeletedSession =
      await this.sessionsQueryRepo.findUserIdByDeviceId(id);
    if (ownerOfDeletedSession === null) {
      throw new NotFoundException();
    }

    if (RFTokenInfo.userId !== ownerOfDeletedSession) {
      throw new HttpException(
        'Вы не являетесь владельцем сессии, которую пытаетесь удалить',
        HttpStatus.FORBIDDEN,
      );
    }

    const deleteStatus: boolean = await this.commandBus.execute(
      new DeleteDeviceSessionCommand(req.params.deviceId),
    );

    if (!deleteStatus) {
      throw new NotFoundException();
    }
  }
}
