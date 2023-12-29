import {Injectable} from '@nestjs/common';
import {SessionViewModel} from './models/auth.models-mongo';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {MapSessionViewModelSQL} from './helpers/map-SessionViewModel-SQL';
import {SessionEntity} from "./entities/sessions.entities";

@Injectable()
export class SessionsQueryRepoSQL {
    constructor(
        @InjectDataSource() protected dataSource: DataSource,
        private readonly mapSessionViewModel: MapSessionViewModelSQL,
    ) {
    }

    async FindAllSessions(userId: string): Promise<Array<SessionViewModel>> {


        const foundSessions = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select([
                "s.id",
                "s.ip",
                "s.title",
                "s.lastActiveDate",
                "s.deviceId",
                "s.deviceName",
                "s.userId",
                "s.RFTokenIAT",
                "s.RFTokenObsoleteDate"
            ])
            .where("s.userId = :userId", {userId})
            .getMany();

        return foundSessions.map((session) =>
            this.mapSessionViewModel.getSessionViewModel(session),
        );
    }

    async findSessionWithRFToken(RFTIAT: number, deviceId: string) {

        const foundSession = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select([
                "s.id",
                "s.ip",
                "s.title",
                "s.lastActiveDate",
                "s.deviceId",
                "s.deviceName",
                "s.userId",
                "s.RFTokenIAT",
                "s.RFTokenObsoleteDate"
            ])
            .where("s.deviceId = :deviceId AND s.RFTokenIAT = :IAt ", {deviceId, IAt: new Date(RFTIAT)})
            .getOne()

        if (foundSession) {
            return this.mapSessionViewModel.getSessionViewModel(foundSession);
        } else {
            return null;
        }
    }

    async findUserIdByDeviceId(deviceId: string) {
        const foundSession = await this.dataSource.getRepository(SessionEntity)
            .createQueryBuilder("s")
            .select([
                "s.id",
                "s.userId"
            ]).where("s.deviceId = :deviceId", {deviceId})
            .getOne()

        if (foundSession) {
            return foundSession.userId;
        } else {
            return null;
        }
    }
}
