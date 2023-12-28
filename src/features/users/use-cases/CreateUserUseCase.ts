import {UserCreateModel, UserInputModel} from '../models/users.models.sql';
import bcrypt from 'bcrypt';
import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepoSQL} from '../users.repo-sql';
import {MailService} from '../../../infrastructure/mail/mail.service';
import {HttpException, HttpStatus} from '@nestjs/common';

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
    ) {
    }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        private readonly usersRepo: UsersRepoSQL,
        private mailService: MailService,
    ) {
    }

    async execute(command: CreateUserCommand): Promise<Result<string>> {
        const passwordHash = await bcrypt.hash(command.inputModel.password, 10); //Соль генерируется автоматически за 10 кругов - второй параметр
        const createDTO: UserCreateModel = {
            ...command.inputModel,
            passwordHash,
            isAuthorSuper: command.isAuthorSuper,
        };

        // Создаем юзера
        const userId = await this.usersRepo.createUser(createDTO);

        // Селектим созданного
        const createdUser = await this.usersRepo.findUserById(userId);
        if (!createdUser) {
            throw new Error('Проблема с созданием польователя');
        }

        if (!command.isAuthorSuper) {
            await this.mailService
                .sendEmailConfirmationMessage(createdUser)
                .catch((err) => {
                    console.log(err);
                    throw new HttpException(
                        'Не удалось отправить письмо',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                });
        }

        return {
            resultCode: ResultCode.success,
            data: createdUser.id,
        };
    }
}
