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
import {
  BlogCreateModel,
  BlogUpdateModel,
  BlogViewModel,
} from './models/blogs.models';
import { BlogsRepo } from './blogs.repo';
import { BlogsQueryRepo } from './blogs.query-repo';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsRepo: BlogsRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly blogsService: BlogsService,
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

  @Post()
  async createBlog(
    @Body() inputModel: BlogCreateModel,
  ): Promise<BlogViewModel> {
    const createdBlog: BlogViewModel = await this.blogsService.createBlog(
      inputModel,
    );

    return createdBlog;
  }

  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string) {
    await this.blogsService.deleteBlog(blogId);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateDTO: BlogUpdateModel,
  ) {
    await this.blogsService.updateBlog(blogId, updateDTO);
  }
}
