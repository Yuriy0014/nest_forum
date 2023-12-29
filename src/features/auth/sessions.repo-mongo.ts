import {Injectable} from '@nestjs/common';
import {
    Session,
    SessionDocument,
    SessionModelType,
} from './models/domain/session.domain-entities';
import {InjectModel} from '@nestjs/mongoose';
import {SessionUpdateFilterModel} from './models/auth.models-mongo';

@Injectable()
export class SessionsRepoMongo {
    constructor(
        @InjectModel(Session.name)
        private readonly sessionModel: SessionModelType,
    ) {
    }

    async save(instanse: SessionDocument): Promise<void> {
        await instanse.save();
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
        const sessionInstance = await this.sessionModel.findOne(filter);
        if (!sessionInstance) return false;

        sessionInstance.ip = updateSessionContent.ip;
        sessionInstance.lastActiveDate = updateSessionContent.lastActiveDate;
        sessionInstance.deviceName = updateSessionContent.deviceName;
        sessionInstance.RFTokenIAT = updateSessionContent.RFTokenIAT;
        sessionInstance.RFTokenObsoleteDate =
            updateSessionContent.RFTokenObsoleteDate;

        await sessionInstance.save();
        return true;
    }
}
