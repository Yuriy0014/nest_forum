import { Injectable } from '@nestjs/common';
import { SessionDBModel, SessionViewModel } from '../models/auth.models';

@Injectable()
export class MapSessionViewModel {
  getSessionViewModel(session: SessionDBModel): SessionViewModel {
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    };
  }
}
