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
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  BlogCreateModel,
  BlogsWithPaginationModel,
  BlogUpdateModel,
  BlogViewModel,
} from './models/blogs.models';
import { BlogsQueryRepo } from './blogs.query-repo';
import { queryBlogPagination } from './helpers/filter';
import {
  PostCreateModelFromBlog,
  PostsWithPaginationModel,
  PostViewModel,
} from '../posts/models/posts.models';
import { queryPostPagination } from '../posts/helpers/filter';
import { PostsQueryRepo } from '../posts/posts.query-repo';
import { PostsService } from '../posts/posts.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CheckUserIdGuard } from '../posts/guards/post.guards';
import { CreateBlogUseCase } from './use-cases/CreateBlogUseCase';
import { UpdateBlogUseCase } from './use-cases/UpdateBlogUseCase';
import { DeleteBlogUseCase } from './use-cases/DeleteBlogUseCase';
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly postsService: PostsService,
    private readonly createBlogUseCase: CreateBlogUseCase,
    private readonly updateBlogUseCase: UpdateBlogUseCase,
    private readonly deleteBlogUseCase: DeleteBlogUseCase,
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
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() inputModel: BlogCreateModel,
  ): Promise<BlogViewModel> {
    const createdBlog: BlogViewModel = await this.createBlogUseCase.execute(
      inputModel,
    );

    return createdBlog;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string) {
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(blogId);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    await this.deleteBlogUseCase.execute(blogId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateDTO: BlogUpdateModel,
  ) {
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(blogId);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    await this.updateBlogUseCase.execute(blogId, updateDTO);
  }

  ////////////////////////////
  ////// Working with posts
  ////////////////////////////
  @Get(':id/posts')
  @UseGuards(CheckUserIdGuard)
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
    @Request() req: any,
  ): Promise<PostsWithPaginationModel> {
    const queryFilter = queryPostPagination(query, blogId);
    const foundPosts: PostsWithPaginationModel =
      await this.postsQueryRepo.FindAllPost(queryFilter, req.userId);

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPosts;
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Param('id') blogId: string,
    @Body() inputModel: PostCreateModelFromBlog,
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
