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
} from './models/blogs.models-mongo';
import { queryBlogPagination } from './helpers/filter';
import {
  PostCreateModelFromBlog,
  PostsWithPaginationModel,
  PostViewModel,
} from '../posts/models/posts.models';
import { queryPostPagination } from '../posts/helpers/filter';
import { PostsQueryRepo } from '../posts/posts.query-repo';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CheckUserIdGuard } from '../posts/guards/post.guards';
import { CreateBlogCommand } from './use-cases/CreateBlogUseCase';
import { DeleteBlogCommand } from './use-cases/DeleteBlogUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBlogCommand } from './use-cases/UpdateBlogUseCase';
import { CreatePostCommand } from '../posts/use-cases/CreatePostUseCase';
import { BlogsQueryRepoSQL } from './blogs.query-repo-sql';

@Controller('blogs')
export class BlogsControllerSa {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepoSQL,
    private readonly postsQueryRepo: PostsQueryRepo,
    private commandBus: CommandBus,
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
      await this.blogsQueryRepo.FindAllBlogs(queryFilter);

    if (!foundBlogs.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundBlogs;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(
    @Body() inputModel: BlogCreateModel,
  ): Promise<BlogViewModel> {
    const createdBlog: BlogViewModel = await this.commandBus.execute(
      new CreateBlogCommand(inputModel),
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
    await this.commandBus.execute(new DeleteBlogCommand(blogId));
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
    await this.commandBus.execute(new UpdateBlogCommand(blogId, updateDTO));
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
    const createdPost: PostViewModel = await this.commandBus.execute(
      new CreatePostCommand(inputModel),
    );

    return createdPost;
  }
}
