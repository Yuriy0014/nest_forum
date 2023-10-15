import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersQueryRepo } from './users.query-repo';
import { UsersService } from './users.service';
import { queryUserPagination } from './helpers/filter';
import {
  UserInputModel,
  UsersWithPaginationModel,
  UserViewModel,
} from './models/users.models';

@Controller('users')
export class UsersController {
  constructor(
    private readonly postsQueryRepo: UsersQueryRepo,
    private readonly postsService: UsersService,
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
      await this.postsQueryRepo.FindAllUsers(queryFilter);

    if (!foundUsers.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundUsers;
  }
  //
  // @Post()
  // async createPost(@Body() inputModel: UserInputModel): Promise<UserViewModel> {
  //   const createdPost: UserViewModel = await this.postsService.createPost(
  //     inputModel,
  //   );
  //
  //   return createdPost;
  // }
  //
  // @Delete(':id')
  // async deletePost(@Param('id') PostId: string) {
  //   await this.postsService.deletePost(PostId);
  // }
}
