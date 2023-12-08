import { LoginInputDTO } from '../models/auth.models-mongo';
import { UserViewModel } from '../../users/models/users.models.mongo';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepoSQL } from '../../users/users.repo-sql';
import { MapUserViewModelSQL } from '../../users/helpers/map-UserViewModel.sql';

export class CheckCredentialsCommand {
  constructor(public loginDTO: LoginInputDTO) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private readonly usersRepo: UsersRepoSQL,
    private readonly mapUserViewModel: MapUserViewModelSQL,
  ) {}

  async execute(
    command: CheckCredentialsCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersRepo.findByLoginOrEmail(
      command.loginDTO.loginOrEmail,
    );
    if (!user) return null;

    const passHash = user.password;

    const result = await bcrypt
      .compare(command.loginDTO.password, passHash)
      .then(function (result) {
        return result;
      });

    if (result) {
      return this.mapUserViewModel.getUserViewModel(user);
    }
    return null;
  }
}
