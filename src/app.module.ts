import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsService } from './features/blogs/blogs.service';
import { BlogsRepo } from './features/blogs/blogs.repo';
import { BlogsQueryRepo } from './features/blogs/blogs.query-repo';
import {
  Blog,
  BlogSchema,
} from './features/blogs/models/domain/blogs.domain-entities';
import { MapBlogViewModel } from './features/blogs/helpers/map-BlogViewModel';
import { PostsController } from './features/posts/posts.controller';
import { PostsService } from './features/posts/posts.service';
import { PostsRepo } from './features/posts/posts.repo';
import { PostsQueryRepo } from './features/posts/posts.query-repo';
import { MapPostViewModel } from './features/posts/helpers/map-PostViewModel';
import { TestingController } from './features/testing/testing.controller';
import { CommentsController } from './features/comments/comments.controller';
import { CommentsService } from './features/comments/comments.service';
import { CommentsRepo } from './features/comments/comments.repo';
import { CommentsQueryRepo } from './features/comments/comments.query-repo';
import { MapCommentViewModel } from './features/comments/helpers/map-CommentViewModel';
import {
  Post,
  PostSchema,
} from './features/posts/models/domain/posts.domain-entities';
import {
  Comment,
  CommentSchema,
} from './features/comments/models/domain/comments.domain-entities';
import { LikesQueryRepo } from './features/likes/likes.query-repo';
import { UsersController } from './features/users/users.controller';
import { UsersQueryRepo } from './features/users/users.query-repo';
import { UsersService } from './features/users/users.service';
import { UsersRepo } from './features/users/users.repo';
import { MapUserViewModel } from './features/users/helpers/map-UserViewModel';
import {
  User,
  UserSchema,
} from './features/users/models/domain/users.domain-entities';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest_forum'),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    AppController,
    TestingController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    AppService,
    // Blogs
    BlogsService,
    BlogsRepo,
    BlogsQueryRepo,
    MapBlogViewModel,
    // Posts
    PostsService,
    PostsRepo,
    PostsQueryRepo,
    MapPostViewModel,
    // Comments
    CommentsService,
    CommentsRepo,
    CommentsQueryRepo,
    MapCommentViewModel,
    // Likes
    LikesQueryRepo,
    // Users
    UsersService,
    UsersQueryRepo,
    UsersRepo,
    MapUserViewModel,
  ],
})
export class AppModule {}
