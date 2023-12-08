import { EmailManager } from '../../../infrastructure/email/email.manager';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt/jwt.service';
import { UsersRepoSQL } from '../../users/users.repo-sql';
import { UsersQueryRepoSQL } from '../../users/users.query-repo-sql';

export class RecoveryPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(
    private readonly usersRepo: UsersRepoSQL,
    private readonly emailManager: EmailManager,
    private readonly usersQueryRepo: UsersQueryRepoSQL,
    private readonly jwtService: JwtService,
  ) {}
  async execute(command: RecoveryPasswordCommand): Promise<boolean> {
    const user = await this.usersQueryRepo.findByLoginOrEmail(command.email);
    // Return true even if current email is not registered (for prevent user's email detection)
    if (!user) return true;
    const passwordRecoveryCode = await this.jwtService.createPassRecoveryCode(
      user,
    );
    await this.usersRepo.addPassRecoveryCode(user.id, passwordRecoveryCode);

    try {
      await this.emailManager.sendPasswordRecoveryMessage(
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
