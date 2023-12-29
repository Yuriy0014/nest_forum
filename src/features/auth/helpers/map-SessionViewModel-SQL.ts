import {Injectable} from '@nestjs/common';
import {SessionEntity} from "../entities/sessions.entities";
import {SessionViewModel} from "../models/auth.models-sql";

@Injectable()
export class MapSessionViewModelSQL {
    getSessionViewModel(session: SessionEntity): SessionViewModel {
        return {
            ip: session.ip,
            title: session.title,
            lastActiveDate: session.lastActiveDate.toISOString(),
            deviceId: session.deviceId,
        };
    }
}
