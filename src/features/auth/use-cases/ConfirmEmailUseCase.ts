import { UsersRepo } from '../../users/users.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailCommand {
  constructor(public code: string | undefined) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    if (command.code === undefined) return false;

    const user = await this.usersRepo.findUserByConfirmationCode(command.code);
    if (!user) return false;
    if (user.canBeConfirmed(command.code)) {
      user.emailConfirmation.isConfirmed = true;
      await this.usersRepo.save(user);
      return true;
    }

    return false;
  }
}
