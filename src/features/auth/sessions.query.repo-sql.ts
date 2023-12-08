import { Injectable } from '@nestjs/common';
import { SessionViewModel } from './models/auth.models-mongo';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MapSessionViewModelSQL } from './helpers/map-SessionViewModel-SQL';

@Injectable()
export class SessionsQueryRepoSQL {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly mapSessionViewModel: MapSessionViewModelSQL,
  ) {}

  async FindAllSessions(userId: string): Promise<Array<SessionViewModel>> {
    const foundSessions = await this.dataSource.query(
      `
        SELECT s."id", s."ip", s."title", s."lastActiveDate", s."deviceId", s."deviceName", 
        s."userId", s."RFTokenIAT", s."RFTokenObsoleteDate"
            FROM public.sessions s
        WHERE (s."userId" = $1)`,
      [userId],
    );
    return foundSessions.map((session) =>
      this.mapSessionViewModel.getSessionViewModel(session),
    );
  }

  async findSessionWithRFToken(RFTIAT: number, deviceId: string) {
    const foundSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public."sessions" s
        WHERE (s."deviceId" = $1 AND s."RFTokenIAT" = $2)`,
      [deviceId, new Date(RFTIAT)],
    );
    if (foundSession[0]) {
      return this.mapSessionViewModel.getSessionViewModel(foundSession[0]);
    } else {
      return null;
    }
  }

  async findUserIdByDeviceId(deviceId: string) {
    const foundSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public."sessions" s
        WHERE (s."deviceId" = $1 )`,
      [deviceId],
    );
    if (foundSession[0]) {
      return foundSession[0].id;
    } else {
      return null;
    }
  }
}
