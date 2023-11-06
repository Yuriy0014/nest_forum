import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../users.repo';
import { MapUserViewModel } from '../helpers/map-UserViewModel';
import { LoginInputDTO } from '../../auth/models/auth.models';
import { UserViewModel } from '../models/users.models';
import bcrypt from 'bcrypt';

@Injectable()
export class CheckCredentialsUseCase {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async execute(loginDTO: LoginInputDTO): Promise<UserViewModel | null> {
    const user = await this.usersRepo.findByLoginOrEmail(loginDTO.loginOrEmail);
    if (!user) return null;

    const passHash = user.accountData.password;

    const result = await bcrypt
      .compare(loginDTO.password, passHash)
      .then(function (result) {
        return result;
      });

    if (result) {
      return this.mapUserViewModel.getUserViewModel(user);
    }
    return null;
  }
}
