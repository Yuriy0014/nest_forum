import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionModelType,
} from '../models/domain/session.domain-entities';
import { SessionsRepoMongo } from '../sessions.repo-mongo.service';
import {
  reqSessionDTOType,
  SessionViewModel,
} from '../models/auth.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepoSQL } from '../sessions.repo-sql';

export class RegisterSessionCommand {
  constructor(public sessionDTO: reqSessionDTOType) {}
}

@CommandHandler(RegisterSessionCommand)
export class RegisterSessionUseCase
  implements ICommandHandler<RegisterSessionCommand>
{
  constructor(private readonly sessionRepo: SessionsRepoSQL) {}

  async execute(command: RegisterSessionCommand): Promise<boolean> {
    try {
      await this.sessionRepo.createSessionInfo(command.sessionDTO);
      return true;
    } catch (e) {
      return false;
    }
  }
}
