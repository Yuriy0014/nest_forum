import { Injectable } from '@nestjs/common';
import {
  Session,
  SessionModelType,
} from './models/domain/session.domain-entities';
import { InjectModel } from '@nestjs/mongoose';
import { SessionViewModel } from './models/auth.models';
import { MapSessionViewModel } from './helpers/map-SessionViewModel';

@Injectable()
export class SessionsQueryRepo {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
    private readonly mapSessionViewModel: MapSessionViewModel,
  ) {}

  async FindAllSessions(userId: string): Promise<Array<SessionViewModel>> {
    const foundSessions = await this.sessionModel
      .find({ userId: userId })
      .lean();
    return foundSessions.map((session) =>
      this.mapSessionViewModel.getSessionViewModel(session),
    );
  }

  async findSessionWithRFToken(RFTIAT: number, deviceId: string) {
    const foundSession = await this.sessionModel.findOne({
      RFTokenIAT: new Date(RFTIAT),
      deviceId: deviceId,
    });
    if (foundSession) {
      return this.mapSessionViewModel.getSessionViewModel(foundSession);
    } else {
      return null;
    }
  }

  async findUserIdByDeviceId(deviceId: string) {
    const foundSession = await this.sessionModel.findOne({
      deviceId: deviceId,
    });
    if (foundSession) {
      return foundSession.userId;
    } else {
      return null;
    }
  }
}
