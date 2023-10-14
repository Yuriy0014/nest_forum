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
  Query,
} from '@nestjs/common';
import {
  BlogCreateModel,
  BlogsWithPaginationModel,
  BlogUpdateModel,
  BlogViewModel,
} from './models/blogs.models';
import { BlogsRepo } from './blogs.repo';
import { BlogsQueryRepo } from './blogs.query-repo';
import { BlogsService } from './blogs.service';
import { queryBlogPagination } from './helpers/filter';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsRepo: BlogsRepo,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly blogsService: BlogsService,
  ) {}

  @Get()
  async findAllBlogs(
    @Query()
    query: {
      searchNameTerm?: string;
      sortBy?: string;
      sortDirection?: string;
      pageNumber?: string;
      pageSize?: string;
    },
  ): Promise<BlogsWithPaginationModel> {
    const queryFilter = queryBlogPagination(query);
    const foundBlogs: BlogsWithPaginationModel =
      await this.blogsQueryRepo.FindAllBlog(queryFilter);

    if (!foundBlogs.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundBlogs;
  }

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
