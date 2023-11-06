import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../models/domain/users.domain-entities';
import { UsersRepo } from '../users.repo';
import { EmailManager } from '../../../infrastructure/email/email.manager';
import { UserCreateModel, UserInputModel } from '../models/users.models';
import bcrypt from 'bcrypt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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

export class CreateUserCommand {
  constructor(
    public inputModel: UserInputModel,
    public isAuthorSuper: boolean,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    private readonly usersRepo: UsersRepo,
    private readonly emailManager: EmailManager,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<string>> {
    const passwordHash = await bcrypt.hash(command.inputModel.password, 10); //Соль генерируется автоматически за 10 кругов - второй параметр
    const createDTO: UserCreateModel = {
      ...command.inputModel,
      passwordHash,
      isAuthorSuper: command.isAuthorSuper,
    };
    const createdUser = this.userModel.createUser(createDTO, this.userModel);
    await this.usersRepo.save(createdUser);

    if (!command.isAuthorSuper) {
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
