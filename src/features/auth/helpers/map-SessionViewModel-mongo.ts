import { Injectable } from '@nestjs/common';
import { SessionDBModel, SessionViewModel } from '../models/auth.models-mongo';

@Injectable()
export class MapSessionViewModelMongo {
  getSessionViewModel(session: SessionDBModel): SessionViewModel {
    const ip = session.ip.length > 1 ? session.ip : session.ip[0];

    return {
      ip: ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    };
  }
}
