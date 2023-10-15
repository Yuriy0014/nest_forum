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
  Put,
  Query,
} from '@nestjs/common';
import {
  BlogCreateModel,
  BlogsWithPaginationModel,
  BlogUpdateModel,
  BlogViewModel,
} from './models/blogs.models';
import { BlogsQueryRepo } from './blogs.query-repo';
import { BlogsService } from './blogs.service';
import { queryBlogPagination } from './helpers/filter';
import {
  PostCreateModel,
  PostsWithPaginationModel,
  PostViewModel,
} from '../posts/models/posts.models';
import { queryPostPagination } from '../posts/helpers/filter';
import { PostsQueryRepo } from '../posts/posts.query-repo';
import { PostsService } from '../posts/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly blogsService: BlogsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly postsService: PostsService,
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
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    await this.blogsService.deleteBlog(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateDTO: BlogUpdateModel,
  ) {
    await this.blogsService.updateBlog(blogId, updateDTO);
  }

  ////////////////////////////
  ////// Working with posts
  ////////////////////////////
  @Get(':id/posts')
  async findAllPosts(
    @Param('id') blogId: string,
    @Query()
    query: {
      searchNameTerm?: string;
      sortBy?: string;
      sortDirection?: string;
      pageNumber?: string;
      pageSize?: string;
      blogId?: string;
    },
  ): Promise<PostsWithPaginationModel> {
    const queryFilter = queryPostPagination(query, blogId);
    const foundPosts: PostsWithPaginationModel =
      await this.postsQueryRepo.FindAllPost(queryFilter);

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPosts;
  }

  @Post(':id/posts')
  async createPost(
    @Param('id') blogId: string,
    @Body() inputModel: PostCreateModel,
  ): Promise<PostViewModel> {
    // Проверяем, что блог существует
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(blogId);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    inputModel.blogId = blogId;
    const createdPost: PostViewModel = await this.postsService.createPost(
      inputModel,
    );

    return createdPost;
  }
}
