import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt/jwt.service';
import { UsersRepoSQL } from '../../users/users.repo-sql';
import { UsersQueryRepoSQL } from '../../users/users.query-repo-sql';
import { MailService } from '../../../infrastructure/mail/mail.service';
import { UserViewModel } from '../../users/models/users.models.sql';

export class RecoveryPasswordCommand {
    constructor(public email: string) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
implements ICommandHandler<RecoveryPasswordCommand>
{
    constructor(
    private readonly usersRepo: UsersRepoSQL,
    private mailService: MailService,
    private readonly usersQueryRepo: UsersQueryRepoSQL,
    private readonly jwtService: JwtService,
    ) {}
    async execute(command: RecoveryPasswordCommand): Promise<boolean> {
        const user: UserViewModel | null =
      await this.usersQueryRepo.findByLoginOrEmail(command.email);
        // Return true even if current email is not registered (for prevent user's email detection)
        if (!user) return true;
        const passwordRecoveryCode = await this.jwtService.createPassRecoveryCode(
            user,
        );
        await this.usersRepo.addPassRecoveryCode(user.id, passwordRecoveryCode);

        try {
            await this.mailService.sendPasswordRecoveryMessage(
                user.login,
                user.email,
                passwordRecoveryCode,
            );
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}
