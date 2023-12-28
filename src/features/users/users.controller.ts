import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {queryUserPagination} from './helpers/filter';
import {
    UserInputModel,
    UsersWithPaginationModel,
    UserViewModel,
} from './models/users.models.mongo';
import {DeleteUserCommand} from './use-cases/DeleteUserUseCase';
import {CommandBus} from '@nestjs/cqrs';
import {CreateUserCommand} from './use-cases/CreateUserUseCase';
import {BasicAuthGuard} from '../auth/guards/basic-auth.guard';
import {UsersQueryRepoSQL} from './users.query-repo-sql';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersController {
    constructor(
        private readonly usersQueryRepo: UsersQueryRepoSQL,
        private readonly commandBus: CommandBus,
    ) {
    }

    @Get()
    async findAllUsers(
        @Query()
            query: {
            sortBy?: string;
            sortDirection?: string;
            pageNumber?: string;
            pageSize?: string;
            searchLoginTerm?: string;
            searchEmailTerm?: string;
        },
    ): Promise<UsersWithPaginationModel> {
        const queryFilter = queryUserPagination(query);
        const foundUsers: UsersWithPaginationModel | null =
            await this.usersQueryRepo.FindAllUsers(queryFilter);
        if (!foundUsers) {
            throw new HttpException("Error occurred", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return foundUsers;
    }

    @Post()
    async createUser(@Body() inputModel: UserInputModel): Promise<any> {
        const createdUser = await this.commandBus.execute(
            new CreateUserCommand(inputModel, true),
        );
        if (createdUser.data === null) {
            throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
        }

        const foundUser: UserViewModel | null =
            await this.usersQueryRepo.findUserById(createdUser.data!);
        if (!foundUser) {
            throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
        }
        return foundUser;
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteUser(@Param('id') userId: string) {
        const foundUser: UserViewModel | null =
            await this.usersQueryRepo.findUserById(userId);

        if (!foundUser) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        const deletion_status = await this.commandBus.execute(
            new DeleteUserCommand(userId),
        );

        if (!deletion_status) {
            throw new HttpException(
                'Не удалось удалить пользователя',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
