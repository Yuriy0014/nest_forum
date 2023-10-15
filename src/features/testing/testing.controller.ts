import {
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  postModelType,
} from '../posts/models/domain/posts.domain-entities';
import {
  Blog,
  BlogModelType,
} from '../blogs/models/domain/blogs.domain-entities';
import {
  User,
  UserModelType,
} from '../users/models/domain/users.domain-entities';
import {
  Like,
  LikeModelType,
  UsersLikesConnection,
  UsersLikesConnectionType,
} from '../likes/models/domain/likes.domain-entities';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    @InjectModel(UsersLikesConnection.name)
    private readonly usersLikesConnectionModel: UsersLikesConnectionType,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await Promise.all([
      this.blogModel.deleteMany({}),
      this.postModel.deleteMany({}),
      this.userModel.deleteMany({}),
      this.likeModel.deleteMany({}),
      this.usersLikesConnectionModel.deleteMany({}),
    ]).catch((e) => {
      console.log(e);
      throw new HttpException('Not Found', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }
}
