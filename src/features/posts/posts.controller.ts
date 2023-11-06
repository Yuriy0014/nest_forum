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
import { PostsQueryRepo } from './posts.query-repo';
import {
  PostCreateModelStandart,
  PostsWithPaginationModel,
  PostUpdateModel,
  PostViewModel,
} from './models/posts.models';
import { queryPostPagination } from './helpers/filter';
import { CommentsQueryRepo } from '../comments/comments.query-repo';
import { queryCommentsWithPagination } from '../comments/helpers/filter';
import {
  CommentInputModel,
  CommentsWithPaginationModel,
  CommentViewModel,
} from '../comments/models/comments.models';
import { MapCommentViewModel } from '../comments/helpers/map-CommentViewModel';
import { UsersQueryRepo } from '../users/users.query-repo';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  likeInputModel,
  likesInfoViewModel,
} from '../likes/models/likes.models';
import { LikesQueryRepo } from '../likes/likes.query-repo';
import { CheckUserIdGuard } from './guards/post.guards';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { UpdatePostUseCase } from './use-cases/UpdatePostUseCase';
import { DeletePostUseCase } from './use-cases/DeletePostUseCase';
import { LikeOperationUseCase } from '../likes/use-cases/LikeOperationUseCase';
import { LikeObjectTypeEnum } from '../likes/models/domain/likes.domain-entities';
import { CreateCommentUseCase } from '../comments/use-cases/CreateCommentUseCase';
import { CommandBus } from '@nestjs/cqrs';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly mapCommentViewModel: MapCommentViewModel,
    private readonly usersQueryRepo: UsersQueryRepo,
    private readonly likesQueryRepo: LikesQueryRepo,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly likeOperationUseCase: LikeOperationUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(CheckUserIdGuard)
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
    @Request() req: any,
  ): Promise<PostsWithPaginationModel> {
    const queryFilter = queryPostPagination(query);
    const foundPosts: PostsWithPaginationModel =
      await this.postsQueryRepo.FindAllPost(queryFilter, req.userId);

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPosts;
  }

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  async findPost(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PostViewModel> {
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(id, req.userId);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return foundPost;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Body() inputModel: PostCreateModelStandart,
  ): Promise<PostViewModel> {
    const createdPost: PostViewModel = await this.commandBus.execute(
      inputModel,
    );

    return createdPost;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id') PostId: string) {
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(PostId);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.deletePostUseCase.execute(PostId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('id') PostId: string,
    @Body() updateDTO: PostUpdateModel,
  ) {
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(PostId);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.updatePostUseCase.execute(PostId, updateDTO);
  }

  ///////////////////
  // Working with comments
  ///////////////////

  @Get(':id/comments')
  @UseGuards(CheckUserIdGuard)
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
    @Request() req: any,
  ): Promise<CommentsWithPaginationModel> {
    // Проверяем, что пост существует
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(id);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const queryFilter = queryCommentsWithPagination(query, id);

    const foundPosts = await this.commentsQueryRepo.findComments(
      queryFilter,
      req.userId,
    );

    if (!foundPosts.items.length) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return foundPosts;
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentsForPost(
    @Body() inputModel: CommentInputModel,
    @Param('id') postId: string,
    @Request() req: any,
  ): Promise<CommentViewModel> {
    // Проверяем, что пост существует
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(postId);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const foundUser = await this.usersQueryRepo.findUserById(req.user.userId);

    const createdComment = await this.createCommentUseCase.execute(
      postId,
      inputModel.content,
      req.user.userId,
      foundUser!.login,
    );
    return this.mapCommentViewModel.getCommentViewModel(
      createdComment,
      req.user.userId,
    );
  }

  ////////////////////////////
  // working with likes
  ////////////////////////////
  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async sendLikeStatus(
    @Param('id') postId: string,
    @Body() inputModel: likeInputModel,
    @Request() req: any,
  ) {
    const foundPost: PostViewModel | null =
      await this.postsQueryRepo.findPostById(postId);
    if (!foundPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const likesInfo: likesInfoViewModel | null =
      await this.likesQueryRepo.findLikesByOwnerId(
        'Post',
        postId,
        req.user.userId,
      );
    if (!likesInfo) {
      throw new HttpException(
        'Internal server Error. Sorry. Unable to get likes info from DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const foundUser = await this.usersQueryRepo.findUserById(req.user.userId);

    const likeOperationStatus: boolean =
      await this.likeOperationUseCase.execute(
        LikeObjectTypeEnum.Post,
        req.params.id,
        likesInfo,
        inputModel.likeStatus,
        req.user.userId,
        foundUser!.login,
      );
    if (!likeOperationStatus) {
      throw new HttpException(
        'Internal server Error. Something went wrong during like operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
