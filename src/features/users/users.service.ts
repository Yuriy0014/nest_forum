import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './models/domain/users.domain-entities';
import {
  UserCreateModel,
  UserInputModel,
  UserViewModel,
} from './models/users.models';
import bcrypt from 'bcrypt';
import { UsersRepo } from './users.repo';
import { EmailManager } from '../../infrastructure/email/email.manager';
import { LoginInputDTO } from '../auth/models/auth.models';
import { MapUserViewModel } from './helpers/map-UserViewModel';

enum ResultCode {
  success,
  internalServerError,
  badRequest,
  incorrectEmail,
}

type Result<T> = {
  resultCode: ResultCode;
  data: T | null;
  errorMessage?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly usersRepo: UsersRepo,
    private readonly emailManager: EmailManager,
    private readonly mapUserViewModel: MapUserViewModel,
  ) {}

  async createUser(
    inputModel: UserInputModel,
    isAuthorSuper: boolean,
  ): Promise<Result<string>> {
    const passwordHash = await bcrypt.hash(inputModel.password, 10); //Соль генерируется автоматически за 10 кругов - второй параметр
    const createDTO: UserCreateModel = {
      ...inputModel,
      passwordHash,
      isAuthorSuper,
    };
    const createdUser = this.userModel.createUser(createDTO, this.userModel);
    await this.usersRepo.save(createdUser);

    if (!isAuthorSuper) {
      this.emailManager
        .sendEmailConfirmationMessage(createdUser)
        .catch((err) => console.log(err));
    }

    return {
      resultCode: ResultCode.success,
      data: createdUser._id.toString(),
    };
  }

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
