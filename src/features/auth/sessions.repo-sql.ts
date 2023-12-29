import {Injectable} from '@nestjs/common';
import {
    reqSessionDTOType,
    SessionUpdateFilterModel,
} from './models/auth.models-sql';
import {v4 as uuidv4} from 'uuid';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import add from 'date-fns/add';
import {SessionEntity} from "./entities/sessions.entities";

@Injectable()
export class SessionsRepoSQL {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async createSessionInfo(sessionDTO: reqSessionDTOType) {
        const id = uuidv4();

        try {
            // Создание экземпляра класса
            const session = new SessionEntity();

            // Задание значений
            session.id = id;
            session.ip = sessionDTO.loginIp;
            session.title = 'Title session';
            session.lastActiveDate = new Date();
            session.deviceId = sessionDTO.deviceId;
            session.deviceName = sessionDTO.deviceName;
            session.userId = sessionDTO.userId;
            session.RFTokenIAT = new Date(sessionDTO.refreshTokenIssuedAt);
            session.RFTokenObsoleteDate = add(new Date(sessionDTO.refreshTokenIssuedAt), {seconds: 20});

            // Сохранение в базу данных
            await this.dataSource.getRepository(SessionEntity).save(session);
        } catch (e) {
            console.log(e);
            return false;
        }

        return id;
    }

    async updateSessionInfo(
        filter: SessionUpdateFilterModel,
        updateSessionContent: {
            ip: string;
            RFTokenObsoleteDate: Date;
            lastActiveDate: Date;
            RFTokenIAT: Date;
            deviceName: string;
        },
    ) {
        // Проверяем, что сессия существует
        const foundSession = await this.dataSource
            .getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select("s.id")
            .where("s.userId = :userId AND s.deviceId = :deviceId AND s.RFTokenIAT = :RFTokenIAT", {
                userId: filter.userId,
                deviceId: filter.deviceId,
                RFTokenIAT: filter.RFTokenIAT
            })
            .getOne();
        if (!foundSession) return false;

        // Обновление свойств экземпляра
        foundSession.ip = updateSessionContent.ip;
        foundSession.lastActiveDate = updateSessionContent.lastActiveDate;
        foundSession.deviceName = updateSessionContent.deviceName;
        foundSession.RFTokenIAT = updateSessionContent.RFTokenIAT;
        foundSession.RFTokenObsoleteDate = updateSessionContent.RFTokenObsoleteDate;

        // Сохранение обновлений
        await this.dataSource.getRepository(SessionEntity).save(foundSession);

        // Проверяем, что запись обновилась
        const foundSessionAfterUpdate = await this.dataSource
            .getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select("s.id")
            .where("s.id = :id AND s.deviceId = :deviceId AND s.RFTokenIAT = :RFTokenIAT", {
                id: foundSession.id, // Убедитесь, что foundSession не массив
                deviceId: filter.deviceId,
                RFTokenIAT: updateSessionContent.RFTokenIAT
            })
            .getOne();
        if (!foundSessionAfterUpdate) return false;

        return true;
    }

    async deleteSessionInfo(currentRFTokenIAT: number, userId: string) {
        // Удаление сессии
        await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder()
            .delete()
            .from(SessionEntity)
            .where("RFTokenIAT = :RFTokenIAT AND userId = :userId", {
                RFTokenIAT: new Date(currentRFTokenIAT),
                userId
            })
            .execute();

        // Проверка, что сессия удалена
        const deletedSession = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select("s.id")
            .where("s.userId = :userId AND s.RFTokenIAT = :RFTokenIAT", {
                userId,
                RFTokenIAT: new Date(currentRFTokenIAT)
            })
            .getOne();

        return deletedSession === null;
    }

    async deleteSessionByDeviceId(deviceId: string) {

        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from(SessionEntity)
            .where("s.deviceId = :deviceId", {deviceId})
            .execute();


        const deletedSession = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select(["s.id"])
            .where("s.deviceId = :deviceId", {deviceId})
            .getOne();

        return deletedSession === null;
    }

    async deleteSessionForUser(
        currentRFTokenIAT: number,
        deviceId: string,
        userId: string,
    ) {
        // Удаление сессий
        await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder()
            .delete()
            .from(SessionEntity)
            .where("RFTokenIAT <> :RFTokenIAT AND userId = :userId AND deviceId <> :deviceId", {
                RFTokenIAT: new Date(currentRFTokenIAT),
                userId,
                deviceId
            })
            .execute();

        // Проверка, что сессия удалена
        const deletedSession = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select("s.id")
            .where("s.userId = :userId AND s.RFTokenIAT = :RFTokenIAT AND s.deviceId = :deviceId", {
                userId,
                RFTokenIAT: new Date(currentRFTokenIAT),
                deviceId
            })
            .getMany();

        return deletedSession.length === 1;
    }
}
