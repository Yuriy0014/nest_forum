import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepoSQL } from '../../users/users.repo-sql';
import { UserDBModel } from '../../users/models/users.models.sql';

export class ConfirmEmailCommand {
  constructor(public code: string | undefined) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersRepo: UsersRepoSQL) {}

  async execute(command: ConfirmEmailCommand): Promise<boolean> {
    if (command.code === undefined) return false;

    const user: UserDBModel | null =
      await this.usersRepo.findUserByConfirmationCode(command.code);
    if (!user) return false;
    debugger;
    if (user.canBeConfirmed(command.code)) {
      await this.usersRepo.confirmEmail(user.id);
      return true;
    }
    return false;
  }
}
