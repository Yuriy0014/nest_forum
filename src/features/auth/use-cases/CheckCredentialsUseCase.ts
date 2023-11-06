import { UsersRepo } from '../../users/users.repo';
import { MapUserViewModel } from '../../users/helpers/map-UserViewModel';
import { LoginInputDTO } from '../models/auth.models';
import { UserViewModel } from '../../users/models/users.models';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CheckCredentialsCommand {
  constructor(public loginDTO: LoginInputDTO) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase
  implements ICommandHandler<CheckCredentialsCommand>
{
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async execute(
    command: CheckCredentialsCommand,
  ): Promise<UserViewModel | null> {
    const user = await this.usersRepo.findByLoginOrEmail(
      command.loginDTO.loginOrEmail,
    );
    if (!user) return null;

    const passHash = user.accountData.password;

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
