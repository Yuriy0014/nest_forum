import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionModelType,
} from '../models/domain/session.domain-entities';
import { SessionsRepo } from '../sessions.repo';
import { reqSessionDTOType, SessionViewModel } from '../models/auth.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RegisterSessionCommand {
  constructor(public sessionDTO: reqSessionDTOType) {}
}

@CommandHandler(RegisterSessionCommand)
export class RegisterSessionUseCase
  implements ICommandHandler<RegisterSessionCommand>
{
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
    private readonly sessionRepo: SessionsRepo,
  ) {}

  async execute(
    command: RegisterSessionCommand,
  ): Promise<SessionViewModel | null> {
    const createdSession = this.sessionModel.createSession(
      command.sessionDTO,
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
