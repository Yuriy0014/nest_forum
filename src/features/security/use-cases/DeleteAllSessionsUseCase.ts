import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  Session,
  SessionModelType,
} from '../../auth/models/domain/session.domain-entities';

export class DeleteAllSessionsCommand {
  constructor(public currentRFTokenIAT: number, public deviceId: string) {}
}

@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase
  implements ICommandHandler<DeleteAllSessionsCommand>
{
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
  ) {}

  async execute(command: DeleteAllSessionsCommand): Promise<boolean> {
    try {
      let sessionInstance = await this.sessionModel.findOne({
        RFTokenIAT: { $ne: new Date(command.currentRFTokenIAT) },
        deviceId: { $ne: command.deviceId },
      });

      while (sessionInstance) {
        await sessionInstance.deleteOne();
        sessionInstance = await this.sessionModel.findOne({
          RFTokenIAT: { $ne: new Date(command.currentRFTokenIAT) },
          deviceId: { $ne: command.deviceId },
        });
      }
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
