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
} from './models/blogs.models-sql';
import {queryBlogPagination} from './helpers/filter';
import {
    PostCreateModelFromBlog,
    PostsWithPaginationModel,
    PostViewModel,
} from '../posts/models/posts.models-sql';
import {queryPostPagination} from '../posts/helpers/filter';
import {BasicAuthGuard} from '../auth/guards/basic-auth.guard';
import {CheckUserIdGuard} from '../posts/guards/post.guards';
import {CreateBlogCommand} from './use-cases/CreateBlogUseCase';
import {DeleteBlogCommand} from './use-cases/DeleteBlogUseCase';
import {CommandBus} from '@nestjs/cqrs';
import {UpdateBlogCommand} from './use-cases/UpdateBlogUseCase';
import {CreatePostCommand} from '../posts/use-cases/CreatePostUseCase';
import {BlogsQueryRepoSQL} from './blogs.query-repo-sql';
import {PostsQueryRepoSQL} from '../posts/posts.query-repo-sql';
import {UpdatePostComand} from '../posts/use-cases/UpdatePostUseCase';
import {PostUpdateModel} from '../posts/models/posts.models-sql';
import {DeletePostCommand} from '../posts/use-cases/DeletePostUseCase';
import {Result} from '../helpers/result_types';
import {ExistingBlogGuard} from './guards/blogs.guards';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsControllerSa {
    constructor(
        private readonly blogsQueryRepo: BlogsQueryRepoSQL,
        private readonly postsQueryRepo: PostsQueryRepoSQL,
        private commandBus: CommandBus,
    ) {
    }

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
    async createBlog(
        @Body() inputModel: BlogCreateModel,
    ): Promise<BlogViewModel> {
        const createdBlog: Result<BlogViewModel> = await this.commandBus.execute(
            new CreateBlogCommand(inputModel),
        );
        if (createdBlog.data === null) {
            throw new HttpException(
                createdBlog.errorMessage!,
                createdBlog.resultCode,
            );
        }
        return createdBlog.data;
    }

    @Delete(':id')
    @HttpCode(204)
    async deleteBlog(@Param('id') blogId: string) {
        const foundBlog: BlogViewModel | null =
            await this.blogsQueryRepo.findBlogById(blogId);
        if (!foundBlog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        const deletionResult = await this.commandBus.execute(
            new DeleteBlogCommand(blogId),
        );

        if (!deletionResult) {
            throw new HttpException(
                'Не удалось удалить блог',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Put(':id')
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
        const updateResult = await this.commandBus.execute(
            new UpdateBlogCommand(blogId, updateDTO),
        );

        if (!updateResult) {
            throw new HttpException(
                'Не удалось обновить блог',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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
        const createdPost: PostViewModel | null = await this.commandBus.execute(
            new CreatePostCommand(inputModel),
        );

        if (!createdPost) {
            throw new HttpException(
                'Не удалось создать пост',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return createdPost;
    }

    @Delete(':blogId/posts/:postId')
    @UseGuards(ExistingBlogGuard)
    @HttpCode(204)
    async deletePost(
        @Param('postId') postId: string,
        @Param('blogId') blogId: string,
    ) {
        const foundBlog: BlogViewModel | null =
            await this.blogsQueryRepo.findBlogById(blogId);
        if (!foundBlog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        const foundPost: PostViewModel | null =
            await this.postsQueryRepo.findPostById(postId);
        if (!foundPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        await this.commandBus.execute(new DeletePostCommand(postId));
    }

    @Put(':blogId/posts/:postId')
    @UseGuards(ExistingBlogGuard)
    @HttpCode(204)
    async updatePost(
        @Param('postId') postId: string,
        @Param('blogId') blogId: string,
        @Body() updateDTO: PostUpdateModel,
    ) {
        const foundBlog: BlogViewModel | null =
            await this.blogsQueryRepo.findBlogById(blogId);
        if (!foundBlog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        const foundPost: PostViewModel | null =
            await this.postsQueryRepo.findPostById(postId);
        if (!foundPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        await this.commandBus.execute(
            new UpdatePostComand(blogId, postId, updateDTO),
        );
    }
}
