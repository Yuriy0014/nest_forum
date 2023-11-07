import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { SessionUpdateFilterModel } from '../models/auth.models';
import { SessionsRepo } from '../sessions.repo';

export class UpdateSessionCommand {
  constructor(
    public currentRFTokenIAT: number,
    public deviceId: string,
    public loginIp: string | string[],
    public RefreshTokenIssuedAt: number,
    public deviceName: string | string[],
    public UserId: string,
  ) {}
}

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionUseCase
  implements ICommandHandler<UpdateSessionCommand>
{
  constructor(private readonly sessionsRepo: SessionsRepo) {}

  async execute(command: UpdateSessionCommand): Promise<boolean> {
    const filter: SessionUpdateFilterModel = {
      deviceId: command.deviceId,
      RFTokenIAT: new Date(command.currentRFTokenIAT),
      userId: command.UserId,
    };

    const updateSessionContent = {
      ip: command.loginIp,
      lastActiveDate: new Date().toISOString(),
      deviceName: command.deviceName,
      RFTokenIAT: new Date(command.RefreshTokenIssuedAt),
      RFTokenObsoleteDate: add(new Date(command.RefreshTokenIssuedAt), {
        seconds: 20,
      }),
    };

    return await this.sessionsRepo.updateSessionInfo(
      filter,
      updateSessionContent,
    );
  }
}
