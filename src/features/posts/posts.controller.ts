import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly postsService: PostsService,
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
    const createdPost: PostViewModel = await this.postsService.createPost(
      inputModel,
    );

    return createdPost;
  }

  @Delete(':id')
  async deletePost(@Param('id') PostId: string) {
    await this.postsService.deletePost(PostId);
  }

  @Put(':id')
  async updatePost(
    @Param('id') PostId: string,
    @Body() updateDTO: PostUpdateModel,
  ) {
    await this.postsService.updatePost(PostId, updateDTO);
  }
}
