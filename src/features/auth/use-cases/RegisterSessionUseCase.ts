import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionModelType,
} from '../models/domain/session.domain-entities';
import { SessionsRepo } from '../sessions.repo';
import { reqSessionDTOType, SessionViewModel } from '../models/auth.models';

@Injectable()
export class RegisterSessionUseCase {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
    private readonly sessionRepo: SessionsRepo,
  ) {}

  async execute(
    sessionDTO: reqSessionDTOType,
  ): Promise<SessionViewModel | null> {
    const createdSession = this.sessionModel.createSession(
      sessionDTO,
      this.sessionModel,
    );

    try {
      await this.sessionRepo.save(createdSession);
      return createdSession;
    } catch (e) {
      return null;
    }
  }
}