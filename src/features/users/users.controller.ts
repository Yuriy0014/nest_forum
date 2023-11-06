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
import { UsersQueryRepo } from './users.query-repo';
import { UsersService } from './users.service';
import { queryUserPagination } from './helpers/filter';
import {
  UserInputModel,
  UsersWithPaginationModel,
  UserViewModel,
} from './models/users.models';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserUseCase } from './use-cases/CreateUserUseCase';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepo: UsersQueryRepo,
    private readonly usersService: UsersService,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

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
    const foundUsers: UsersWithPaginationModel =
      await this.usersQueryRepo.FindAllUsers(queryFilter);

    return foundUsers;
  }

  @Post()
  async createUser(@Body() inputModel: UserInputModel): Promise<any> {
    const createdUser = await this.createUserUseCase.execute(inputModel, true);
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
  async deleteUser(@Param('id') UserId: string) {
    const deletion_status = await this.usersService.deleteUser(UserId);
    if (!deletion_status) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
