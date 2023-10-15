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
import { PostsQueryRepo } from './posts.query-repo';
import { PostsService } from './posts.service';
import {
  PostCreateModel,
  PostsWithPaginationModel,
  PostUpdateModel,
  PostViewModel,
} from './models/posts.models';
import { queryPostPagination } from './helpers/filter';
import { BlogViewModel } from '../blogs/models/blogs.models';
import { BlogsQueryRepo } from '../blogs/blogs.query-repo';
import { CommentsQueryRepo } from '../comments/comments.query-repo';
import { queryCommentsWithPagination } from '../comments/helpers/filter';
import { CommentsWithPaginationModel } from '../comments/models/comments.models';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
  async findAllPosts(
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
    const queryFilter = queryPostPagination(query);
    const foundPosts: PostsWithPaginationModel =
      await this.postsQueryRepo.FindAllPost(queryFilter);

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPosts;
  }

  @Get(':id')
  async findPost(@Param('id') id: string): Promise<PostViewModel> {
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(id);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPost;
  }

  @Post()
  async createPost(
    @Body() inputModel: PostCreateModel,
  ): Promise<PostViewModel> {
    const foundBlog: BlogViewModel | null =
      await this.blogsQueryRepo.findBlogById(inputModel.blogId);
    if (!foundBlog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const createdPost: PostViewModel = await this.postsService.createPost(
      inputModel,
    );

    return createdPost;
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') PostId: string) {
    await this.postsService.deletePost(PostId);
  }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') PostId: string,
    @Body() updateDTO: PostUpdateModel,
  ) {
    await this.postsService.updatePost(PostId, updateDTO);
  }

  ///////////////////
  // Working
  ///////////////////

  @Get(':id/comments')
  async findCommentsForPost(
    @Query()
    query: {
      searchNameTerm?: string;
      sortBy?: string;
      sortDirection?: string;
      pageNumber?: string;
      pageSize?: string;
      blogId?: string;
    },
    @Param('id') id: string,
  ): Promise<CommentsWithPaginationModel> {
    // Проверяем, что пост существует
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(id);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const queryFilter = queryCommentsWithPagination(query, id);

    const foundPosts = await this.commentsQueryRepo.findComments(queryFilter);

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return foundPosts;
  }
}
