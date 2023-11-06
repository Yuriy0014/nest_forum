import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionModelType,
} from '../models/domain/session.domain-entities';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteSessionCommand {
  constructor(public currentRFTokenIAT: number, public userId: string) {}
}

@CommandHandler(DeleteSessionCommand)
export class RegisterSessionUseCase
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
  ) {}

  async execute(command: DeleteSessionCommand): Promise<boolean> {
    const sessionInstance = await this.sessionModel.findOne({
      RFTokenIAT: new Date(command.currentRFTokenIAT),
      userId: command.userId,
    });
    if (!sessionInstance) return false;

    await sessionInstance.deleteOne();
    return true;
  }
}
