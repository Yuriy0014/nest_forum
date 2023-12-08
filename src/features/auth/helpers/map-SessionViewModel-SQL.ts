import { Injectable } from '@nestjs/common';
import {
  SessionDBModel,
  SessionViewModel,
} from '../../users/models/users.models.sql';

@Injectable()
export class MapSessionViewModelSQL {
  getSessionViewModel(session: SessionDBModel): SessionViewModel {
    return {
      ip: session.ip,
      title: session.title,
      lastActiveDate: session.lastActiveDate,
      deviceId: session.deviceId,
    };
  }
}
