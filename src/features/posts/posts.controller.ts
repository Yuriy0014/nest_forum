import {
  Body,
  Controller,
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
  PostsWithPaginationModel,
  PostViewModel,
} from './models/posts.models-sql';
import { queryPostPagination } from './helpers/filter';
import { queryCommentsWithPagination } from '../comments/helpers/filter';
import {
  CommentInputModel,
  CommentsWithPaginationModel,
  CommentViewModel,
} from '../comments/models/comments.models-sql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  likeInputModel,
  likesInfoViewModel,
} from '../likes/models/likes.models-sql';
import { CheckUserIdGuard } from './guards/post.guards';
import { LikeOperationCommand } from '../likes/use-cases/LikeOperationUseCase';
import { LikeObjectTypeEnum } from '../likes/models/domain/likes.domain-entities';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../comments/use-cases/CreateCommentUseCase';
import { PostsQueryRepoSQL } from './posts.query-repo-sql';
import { UsersQueryRepoSQL } from '../users/users.query-repo-sql';
import { LikesQueryRepoSQL } from '../likes/likes.query-repo-sql';
import { CommentsQueryRepoSQL } from '../comments/comments.query-repo-sql';
import { MapCommentViewModelSQL } from '../comments/helpers/map-CommentViewModel-sql';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsQueryRepo: PostsQueryRepoSQL,
    private readonly commentsQueryRepo: CommentsQueryRepoSQL,
    private readonly mapCommentViewModel: MapCommentViewModelSQL,
    private readonly usersQueryRepo: UsersQueryRepoSQL,
    private readonly likesQueryRepo: LikesQueryRepoSQL,
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

    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand(
        postId,
        inputModel.content,
        req.user.userId,
        foundUser!.login,
      ),
    );

    if (!createdCommentId) {
      throw new HttpException(
        'При добавлении комментария произошла ошибочка :(',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const createdComment = await this.commentsQueryRepo.findCommentById(
      createdCommentId,
      req.user.userId,
    );

    if (!createdComment) {
      throw new HttpException(
        'При добавлении комментария произошла ошибочка :(',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createdComment;
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

    const likeOperationStatus: boolean = await this.commandBus.execute(
      new LikeOperationCommand(
        LikeObjectTypeEnum.Post,
        req.params.id,
        likesInfo,
        inputModel.likeStatus,
        req.user.userId,
        foundUser!.login,
      ),
    );
    if (!likeOperationStatus) {
      throw new HttpException(
        'Internal server Error. Something went wrong during like operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
// :)
