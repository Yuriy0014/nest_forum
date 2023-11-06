import { Injectable } from '@nestjs/common';
import { UserViewModel } from './models/users.models';
import bcrypt from 'bcrypt';
import { UsersRepo } from './users.repo';
import { LoginInputDTO } from '../auth/models/auth.models';
import { MapUserViewModel } from './helpers/map-UserViewModel';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepo,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async checkCredentials(
    loginDTO: LoginInputDTO,
  ): Promise<UserViewModel | null> {
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
