import { Injectable } from '@nestjs/common';
import { SessionDocument } from './models/domain/session.domain-entities';

@Injectable()
export class SessionsRepo {
  async save(instanse: SessionDocument): Promise<void> {
    await instanse.save();
  }
}
