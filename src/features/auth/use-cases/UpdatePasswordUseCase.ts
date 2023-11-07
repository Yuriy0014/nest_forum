import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepo } from '../../users/users.repo';
import bcrypt from 'bcrypt';

export class UpdatePasswordCommand {
  constructor(public newPassword: string, public userId: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class RegisterSessionUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: UpdatePasswordCommand): Promise<boolean> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return false;

    const passwordHash = await bcrypt.hash(command.newPassword, 10); //Соль генерируется автоматически за 10 кругов - второй параметр
    user.updatePass(passwordHash);

    await this.usersRepo.save(user);
    return true;
  }
}
