import { EmailManager } from '../../../infrastructure/email/email.manager';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepoSQL } from '../../users/users.repo-sql';

export class ResendEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    private readonly usersRepo: UsersRepoSQL,
    private readonly emailManager: EmailManager,
  ) {}
  async execute(command: ResendEmailCommand): Promise<boolean> {
    if (command.email === undefined) return false;
    const user = await this.usersRepo.findByLoginOrEmail(command.email);
    if (!user) return false;
    if (user.isEmailConfirmed) return false;

    const newConfirmationCode =
      await this.usersRepo.updateUserEmailConfirmationInfo(user.id);

    const updatedUser = await this.usersRepo.findByLoginOrEmail(command.email);

    if (!updatedUser) return false;

    // Проверяем, что новый код успешно записался в базу
    if (updatedUser.emailConfirmationCode !== newConfirmationCode) return false;

    try {
      await this.emailManager.sendEmailConfirmationMessage(updatedUser);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
