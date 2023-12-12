import { Injectable } from '@nestjs/common';
import {
  reqSessionDTOType,
  SessionUpdateFilterModel,
} from './models/auth.models-sql';
import { v4 as uuidv4 } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import add from 'date-fns/add';

@Injectable()
export class SessionsRepoSQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createSessionInfo(sessionDTO: reqSessionDTOType) {
    const id = uuidv4();

    // try {
    await this.dataSource.query(
      `
        INSERT INTO public.sessions(
        "id", "ip", "title", 
        "lastActiveDate", "deviceId", "deviceName",
         "userId", "RFTokenIAT", "RFTokenObsoleteDate")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        id,
        sessionDTO.loginIp,
        'Title session',
        new Date(),
        sessionDTO.deviceId,
        sessionDTO.deviceName,
        sessionDTO.userId,
        new Date(sessionDTO.refreshTokenIssuedAt),
        add(new Date(sessionDTO.refreshTokenIssuedAt), {
          seconds: 2000,
        }),
      ],
    );
    // } catch (e) {
    //   console.log(e);
    //   return false;
    // }

    return id;
  }

  async updateSessionInfo(
    filter: SessionUpdateFilterModel,
    updateSessionContent: {
      ip: string | string[];
      RFTokenObsoleteDate: Date | any;
      lastActiveDate: string;
      RFTokenIAT: Date;
      deviceName: string | string[];
    },
  ) {
    // Проверяем, что сессия существует
    const foundSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public.sessions s
        WHERE (s."userId" = $1 AND s."deviceId" = $2 AND s."RFTokenIAT" = $3)`,
      [filter.userId, filter.deviceId, filter.RFTokenIAT],
    );
    if (!foundSession[0]) return false;

    // Обновляем запись
    await this.dataSource.query(
      `
    UPDATE public.sessions
        SET "ip"=$2, "lastActiveDate"=$3, "deviceName"=$4, "RFTokenIAT"=$5, "RFTokenObsoleteDate"=$6
        WHERE "id" = $1
    `,
      [
        foundSession[0].id,
        updateSessionContent.ip,
        updateSessionContent.lastActiveDate,
        updateSessionContent.deviceName,
        updateSessionContent.RFTokenIAT,
        updateSessionContent.RFTokenObsoleteDate,
      ],
    );

    // Проверяем, что запись обновилась
    const foundSessionAfterUpdate = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public.sessions s
        WHERE (s."id" = $1 AND s."deviceId" = $2 AND s."RFTokenIAT" = $3)`,
      [foundSession[0].id, filter.deviceId, updateSessionContent.RFTokenIAT],
    );
    if (!foundSessionAfterUpdate[0]) return false;

    return true;
  }

  async deleteSessionInfo(currentRFTokenIAT: number, userId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public.sessions
        WHERE "RFTokenIAT" = $1 AND "userId" = $2;`,
      [new Date(currentRFTokenIAT), userId],
    );

    const deletedSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public.sessions s
        WHERE (s."userId" = $1 AND s."RFTokenIAT" = $2)`,
      [userId, new Date(currentRFTokenIAT)],
    );

    return deletedSession.length === 0;
  }

  async deleteSessionByDeviceId(deviceId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public.sessions
        WHERE "deviceId" = $1;`,
      [deviceId],
    );

    const deletedSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public.sessions s
        WHERE (s."deviceId" = $1)`,
      [deviceId],
    );

    return deletedSession.length === 0;
  }

  async deleteSessionForUser(
    currentRFTokenIAT: number,
    deviceId: string,
    userId: string,
  ) {
    await this.dataSource.query(
      `
        DELETE FROM public.sessions
        WHERE "RFTokenIAT" <> $1 AND "userId" = $2 AND "deviceId" <> $3`,
      [new Date(currentRFTokenIAT), userId, deviceId],
    );

    const deletedSession = await this.dataSource.query(
      `
        SELECT s."id"
        FROM public.sessions s
        WHERE (s."userId" = $1 AND s."RFTokenIAT" = $2 AND s."deviceId" = $3)`,
      [userId, new Date(currentRFTokenIAT), deviceId],
    );

    return deletedSession.length === 1;
  }
}
