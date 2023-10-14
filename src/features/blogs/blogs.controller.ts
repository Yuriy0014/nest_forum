import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BlogCreateModel, BlogViewModel } from './models/blogs.models';
import { BlogsRepo } from './blogs.repo';
import { BlogsQueryRepo } from './blogs.query-repo';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsRepo: BlogsRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
  ) {}

  // @Get()
  // async findAllBlogs(): Promise<BlogViewModel[]> {}

  @Get(':id')
  async findBlog(@Param('id') id: string): Promise<BlogViewModel> {
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(id);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundBlog;
  }
  //
  // @Post()
  // createBlog(@Body() inputModel: BlogCreateModel) {}
  //
  // @Delete(':id')
  // deleteBlog({ blogId }: { blogId: string }) {
  //   return;
  // }
  //
  // @Put(':id')
  // updateBlog(@Param('id') userId: string, @Body() model: BlogCreateModel) {}
}
