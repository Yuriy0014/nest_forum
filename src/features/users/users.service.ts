import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from './models/domain/users.domain-entities';
import { UserCreateModel, UserInputModel } from './models/users.models';
import bcrypt from 'bcrypt';
import { UsersRepo } from './users.repo';
import { EmailManager } from '../../infrastructure/email/email.manager';

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
}
