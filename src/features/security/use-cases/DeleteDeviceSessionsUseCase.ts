import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepoSQL } from '../../auth/sessions.repo-sql';

export class DeleteDeviceSessionCommand {
    constructor(public deviceId: string) {}
}

@CommandHandler(DeleteDeviceSessionCommand)
export class DeleteDeviceSessionsUseCase
implements ICommandHandler<DeleteDeviceSessionCommand>
{
    constructor(private readonly sessionRepo: SessionsRepoSQL) {}

    async execute(command: DeleteDeviceSessionCommand): Promise<boolean> {
        return this.sessionRepo.deleteSessionByDeviceId(command.deviceId);
    }
}
