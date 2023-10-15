import { Injectable } from '@nestjs/common';
import { UserDocument } from './models/domain/users.domain-entities';

@Injectable()
export class UsersRepo {
  async save(createdUser: UserDocument) {
    await createdUser.save();
  }
}
