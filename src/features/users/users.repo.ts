import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  UserModelType,
} from './models/domain/users.domain-entities';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepo {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
  ) {}

  async save(createdUser: UserDocument) {
    await createdUser.save();
  }

  async findUserById(UserId: string): Promise<UserDocument | null> {
    const foundUser: UserDocument | null = await this.userModel.findById(
      UserId,
    );
    if (foundUser) {
      return foundUser;
    } else {
      return null;
    }
  }

  async deleteUser(instance: UserDocument): Promise<boolean> {
    await instance.deleteOne();
    return true;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const user = await this.userModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    });

    if (user) {
      return user;
    }
    return null;
  }
}
