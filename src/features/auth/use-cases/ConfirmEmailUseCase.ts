import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UsersRepoSQL} from '../../users/users.repo-sql';
import {UserEntity} from "../../users/entities/user.entities";

export class ConfirmEmailCommand {
    constructor(public code: string | undefined) {
    }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
implements ICommandHandler<ConfirmEmailCommand> {
    constructor(private readonly usersRepo: UsersRepoSQL) {
    }

    async execute(command: ConfirmEmailCommand): Promise<boolean> {
        if (command.code === undefined) return false;

        const user: UserEntity | null =
            await this.usersRepo.findUserByConfirmationCode(command.code);
        if (!user) return false;
        debugger;
        if (user.canBeConfirmed(command.code)) {
            await this.usersRepo.confirmEmail(user.id);
            return true;
        }
        return false;
    }
}
