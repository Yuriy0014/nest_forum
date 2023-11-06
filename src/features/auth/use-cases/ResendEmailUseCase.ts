import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersRepo } from '../../users/users.repo';
import { EmailManager } from '../../../infrastructure/email/email.manager';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ResendEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly emailManager: EmailManager,
  ) {}
  async execute(command: ResendEmailCommand): Promise<boolean> {
    if (command.email === undefined) return false;
    const user = await this.usersRepo.findByLoginOrEmail(command.email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;

    // Обновляем код подтверждения
    user.emailConfirmation = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
      isConfirmed: false,
    };
    //Перезаписываем пользователя
    const updatedUser = await this.usersRepo.updateUserEmailConfirmationInfo(
      user._id,
      user,
    );
    if (!updatedUser) return false;

    try {
      await this.emailManager.sendEmailConfirmationMessage(user);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
}
