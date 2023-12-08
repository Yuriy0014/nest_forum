import { UsersRepoMongo } from '../users.repo-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepo: UsersRepoMongo) {}

  async execute(command: DeleteUserCommand): Promise<boolean> {
    const user = await this.usersRepo.findUserById(command.userId);
    if (!user) return false;

    return await this.usersRepo.deleteUser(user);
  }
}
