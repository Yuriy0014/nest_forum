import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';
import { PostsQueryRepo } from '../posts/posts.query-repo';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { UserInputModel } from '../users/models/users.models';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly blogsService: BlogsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly postsService: PostsService,
  ) {}

  @Post('registration')
  @HttpCode(204)
  async createBlog(@Body() inputModel: UserInputModel): Promise<void> {
    const createdUser = await this.userService.createUser(inputModel, false);
    if (createdUser.data === null) {
      throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);
    }
  }
}
