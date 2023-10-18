import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  UserModelType,
} from './models/domain/users.domain-entities';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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

  async updateUserEmailConfirmationInfo(
    _id: mongoose.Types.ObjectId,
    user: UserDocument,
  ) {
    const userInstance = await this.userModel.findOne({ _id: _id });
    if (!userInstance) return false;

    await userInstance.replaceOne(user);

    return true;
  }

  async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}
