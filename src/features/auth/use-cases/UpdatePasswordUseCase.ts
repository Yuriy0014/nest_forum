import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UsersRepoSQL } from '../../users/users.repo-sql';

export class UpdatePasswordCommand {
  constructor(public newPassword: string, public userId: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(private readonly usersRepo: UsersRepoSQL) {}

  async execute(command: UpdatePasswordCommand): Promise<boolean> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return false;

    const passwordHash = await bcrypt.hash(command.newPassword, 10); //Соль генерируется автоматически за 10 кругов - второй параметр
    await this.usersRepo.updatePass(user.id, passwordHash);

    return true;
  }
}
