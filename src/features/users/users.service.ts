import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/domain/users.domain-entities';
import { UserViewModel } from './models/users.models';
import bcrypt from 'bcrypt';
import { UsersRepo } from './users.repo';
import { LoginInputDTO } from '../auth/models/auth.models';
import { MapUserViewModel } from './helpers/map-UserViewModel';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersRepo: UsersRepo,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async deleteUser(UserId: string): Promise<boolean> {
    const user = await this.usersRepo.findUserById(UserId);
    if (!user) return false;

    return await this.usersRepo.deleteUser(user);
  }

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
