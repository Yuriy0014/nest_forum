import { Injectable } from '@nestjs/common';
import { UserDBModel, UserViewModel } from '../models/users.models.mongo';

@Injectable()
export class MapUserViewModel {
  getUserViewModel(user: UserDBModel): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}
