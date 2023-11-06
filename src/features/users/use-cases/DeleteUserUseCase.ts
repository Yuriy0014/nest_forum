import { UsersRepo } from '../users.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepo: UsersRepo) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return false;

    return await this.usersRepo.deleteUser(user);
  }
}
