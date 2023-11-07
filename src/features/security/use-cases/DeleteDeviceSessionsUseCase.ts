import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  Session,
  SessionModelType,
} from '../../auth/models/domain/session.domain-entities';

export class DeleteDeviceSessionsCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeleteDeviceSessionsCommand)
export class DeleteDeviceSessionsUseCase
  implements ICommandHandler<DeleteDeviceSessionsCommand>
{
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: SessionModelType,
  ) {}

  async execute(command: DeleteDeviceSessionsCommand): Promise<boolean> {
    const sessionInstance = await this.sessionModel.findOne({
      deviceId: command.deviceId,
    });
    if (!sessionInstance) return false;

    await sessionInstance.deleteOne();
    return true;
  }
}
