import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './features/blogs/blogs.controller';
import { BlogsRepoMongo } from './features/blogs/blogs.repo-mongo';
import { BlogsQueryRepoMongo } from './features/blogs/blogs.query-repo-mongo';
import {
  Blog,
  BlogSchema,
} from './features/blogs/models/domain/blogs.domain-entities';
import { MapBlogViewModelMongo } from './features/blogs/helpers/map-BlogViewModelMongo';
import { PostsController } from './features/posts/posts.controller';
import { PostsRepo } from './features/posts/posts.repo';
import { PostsQueryRepo } from './features/posts/posts.query-repo';
import { MapPostViewModel } from './features/posts/helpers/map-PostViewModel';
import { TestingController } from './features/testing/testing.controller';
import { CommentsController } from './features/comments/comments.controller';
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
import { UsersRepoMongo } from './features/users/users.repo-mongo';
import { MapUserViewModel } from './features/users/helpers/map-UserViewModel';
import {
  User,
  UserSchema,
} from './features/users/models/domain/users.domain-entities';
import { ConfigModule } from '@nestjs/config';
import { EmailManager } from './infrastructure/email/email.manager';
import { EmailAdapter } from './infrastructure/email/email.adapter';
import {
  Like,
  LikeSchema,
  UsersLikesConnection,
  UsersLikesConnectionSchema,
} from './features/likes/models/domain/likes.domain-entities';
import * as process from 'process';
import { AuthController } from './features/auth/auth.controller';
import { JwtService } from './infrastructure/jwt/jwt.service';
import { SessionsRepoMongo } from './features/auth/sessions.repo-mongo.service';
import {
  Session,
  SessionSchema,
} from './features/auth/models/domain/session.domain-entities';
import { BasicStrategy } from './features/auth/strategies/basic.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { LikesRepo } from './features/likes/likes.repo';
import { MapLikeViewModel } from './features/likes/helpers/map-likesViewModel';
import { ExistingBlogConstraint } from './features/posts/guards/CustomDoesBlogExist';
import { CreateBlogUseCase } from './features/blogs/use-cases/CreateBlogUseCase';
import { UpdateBlogUseCase } from './features/blogs/use-cases/UpdateBlogUseCase';
import { DeleteBlogUseCase } from './features/blogs/use-cases/DeleteBlogUseCase';
import { CreatePostUseCase } from './features/posts/use-cases/CreatePostUseCase';
import { UpdatePostUseCase } from './features/posts/use-cases/UpdatePostUseCase';
import { DeletePostUseCase } from './features/posts/use-cases/DeletePostUseCase';
import { LikeOperationUseCase } from './features/likes/use-cases/LikeOperationUseCase';
import { CreateCommentUseCase } from './features/comments/use-cases/CreateCommentUseCase';
import { UpdateCommentUseCase } from './features/comments/use-cases/UpdateCommentUseCase';
import { DeleteCommentUseCase } from './features/comments/use-cases/DeleteCommentUseCase';
import { CreateUserUseCase } from './features/users/use-cases/CreateUserUseCase';
import { DeleteUserUseCase } from './features/users/use-cases/DeleteUserUseCase';
import { CheckCredentialsUseCase } from './features/auth/use-cases/CheckCredentialsUseCase';
import { ConfirmEmailUseCase } from './features/auth/use-cases/ConfirmEmailUseCase';
import { ResendEmailUseCase } from './features/auth/use-cases/ResendEmailUseCase';
import { RegisterSessionUseCase } from './features/auth/use-cases/RegisterSessionUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteSessionUseCase } from './features/auth/use-cases/DeleteSessionUseCase';
import { SessionsQueryRepoMongo } from './features/auth/sessions.query-repo-mongo.service';
import { MapSessionViewModelMongo } from './features/auth/helpers/map-SessionViewModel-mongo';
import { RecoveryPasswordUseCase } from './features/auth/use-cases/RecoveryPasswordUseCase';
import { UpdatePasswordUseCase } from './features/auth/use-cases/UpdatePasswordUseCase';
import { ThrottlerModule } from '@nestjs/throttler';
import { UpdateSessionUseCase } from './features/auth/use-cases/UpdateSessionUseCase';
import { DeleteAllSessionsUseCase } from './features/security/use-cases/DeleteAllSessionsUseCase';
import { DeleteDeviceSessionsUseCase } from './features/security/use-cases/DeleteDeviceSessionsUseCase';
import { SecurityController } from './features/security/security.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapUserViewModelSQL } from './features/users/helpers/map-UserViewModel.sql';
import { UsersQueryRepoMongo } from './features/users/users.query-repo-mongo';
import { UsersQueryRepoSQL } from './features/users/users.query-repo-sql';
import { UsersRepoSQL } from './features/users/users.repo-sql';
import { SessionsRepoSQL } from './features/auth/sessions.repo-sql';
import { SessionsQueryRepoSQL } from './features/auth/sessions.query.repo-sql';
import { MapSessionViewModelSQL } from './features/auth/helpers/map-SessionViewModel-SQL';
import { UserObjectFromRawData } from './features/users/helpers/map-rawsql-to-object';
import { BlogsControllerSa } from './features/blogs/blogs.controller-sa';
import { MapBlogViewModelSQL } from './features/blogs/helpers/map-BlogViewModelSQL';
import { BlogsQueryRepoSQL } from './features/blogs/blogs.query-repo-sql';

const useCases = [
  ///Blogs
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  ///Posts
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  ///Likes
  LikeOperationUseCase,
  //Comments
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  // Users
  CreateUserUseCase,
  DeleteUserUseCase,
  // Auth
  CheckCredentialsUseCase,
  ConfirmEmailUseCase,
  ResendEmailUseCase,
  RegisterSessionUseCase,
  DeleteSessionUseCase,
  RecoveryPasswordUseCase,
  UpdatePasswordUseCase,
  UpdateSessionUseCase,
  // Security
  DeleteAllSessionsUseCase,
  DeleteDeviceSessionsUseCase,
];

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        // Временно отключаю IP retriction
        limit: 5,
      },
    ]),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ep-plain-flower-56967518.us-east-2.aws.neon.tech',
      port: 5432,
      username: process.env.PG_NAME,
      password: process.env.PG_PASS,
      database: 'blog_nest',
      autoLoadEntities: false,
      synchronize: false,
      ssl: true,
    }),
    PassportModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: Like.name, schema: LikeSchema },
      { name: UsersLikesConnection.name, schema: UsersLikesConnectionSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    CqrsModule,
  ],
  controllers: [
    AppController,
    TestingController,
    BlogsController,
    BlogsControllerSa,
    PostsController,
    CommentsController,
    UsersController,
    AuthController,
    SecurityController,
  ],
  providers: [
    AppService,
    // Blogs
    BlogsRepoMongo,
    BlogsQueryRepoMongo,
    BlogsQueryRepoSQL,
    MapBlogViewModelMongo,
    MapBlogViewModelSQL,
    // Posts
    PostsRepo,
    PostsQueryRepo,
    MapPostViewModel,
    // Comments
    CommentsRepo,
    CommentsQueryRepo,
    MapCommentViewModel,
    // Likes
    LikesQueryRepo,
    LikesRepo,
    MapLikeViewModel,
    // Users
    UsersQueryRepoMongo,
    UsersQueryRepoSQL,
    UsersRepoMongo,
    UsersRepoSQL,
    MapUserViewModel,
    MapUserViewModelSQL,
    UserObjectFromRawData,
    // Email
    EmailManager,
    EmailAdapter,
    // JWT
    JwtService,
    // Auth
    SessionsRepoMongo,
    SessionsRepoSQL,
    SessionsQueryRepoMongo,
    SessionsQueryRepoSQL,
    BasicStrategy,
    JwtStrategy,
    LocalStrategy,
    MapSessionViewModelMongo,
    MapSessionViewModelSQL,
    ///
    ExistingBlogConstraint,
    /// UseCases
    ...useCases,
  ],
})
export class AppModule {}
