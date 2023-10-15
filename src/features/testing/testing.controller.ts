import { Controller, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  postModelType,
} from '../posts/models/domain/posts.domain-entities';
import {
  Blog,
  BlogModelType,
} from '../blogs/models/domain/blogs.domain-entities';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
  ) {}

  @Delete('all-data')
  async deleteAll() {
    await Promise.all([
      this.blogModel.deleteMany({}),
      this.postModel.deleteMany({}),
    ]).catch((e) => {
      console.log(e);
      throw new HttpException('Not Found', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  }
}
