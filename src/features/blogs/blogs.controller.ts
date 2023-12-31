import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    BlogsWithPaginationModel,
    BlogViewModel,
} from './models/blogs.models-sql';
import {queryBlogPagination} from './helpers/filter';
import {PostsWithPaginationModel} from '../posts/models/posts.models-mongo';
import {queryPostPagination} from '../posts/helpers/filter';
import {CheckUserIdGuard} from '../posts/guards/post.guards';
import {BlogsQueryRepoSQL} from './blogs.query-repo-sql';
import {PostsQueryRepoSQL} from '../posts/posts.query-repo-sql';

@Controller('blogs')
export class BlogsController {
    constructor(
        private readonly blogsQueryRepo: BlogsQueryRepoSQL,
        private readonly postsQueryRepo: PostsQueryRepoSQL,
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
            blogId: string;
        },
        @Request() req: any,
    ): Promise<PostsWithPaginationModel> {
        const queryFilter = queryPostPagination(query, blogId);
        const foundPosts: PostsWithPaginationModel =
            await this.postsQueryRepo.FindAllPost(queryFilter, req.userId);

        return foundPosts;
    }
}
