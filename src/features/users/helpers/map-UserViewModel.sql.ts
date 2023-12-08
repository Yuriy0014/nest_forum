import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../models/users.models.mongo';
import { UserDBModel } from '../models/users.models.sql';

@Injectable()
export class MapUserViewModelSQL {
  getUserViewModel(user: UserDBModel): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toString(),
    };
  }
}
