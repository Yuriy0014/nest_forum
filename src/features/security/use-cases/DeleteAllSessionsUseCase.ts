import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepoSQL } from '../../auth/sessions.repo-sql';

export class DeleteAllSessionsCommand {
    constructor(
    public currentRFTokenIAT: number,
    public deviceId: string,
    public userId: string,
    ) {}
}

@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase
implements ICommandHandler<DeleteAllSessionsCommand>
{
    constructor(private readonly sessionRepo: SessionsRepoSQL) {}

    async execute(command: DeleteAllSessionsCommand): Promise<boolean> {
        try {
            await this.sessionRepo.deleteSessionForUser(
                command.currentRFTokenIAT,
                command.deviceId,
                command.userId,
            );
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }
}
