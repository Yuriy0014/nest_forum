import {Module} from "@nestjs/common";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {MongooseModule} from "@nestjs/mongoose";
import {BlogsRepoMongo} from "./features/blogs/blogs.repo-mongo";
import {BlogsQueryRepoMongo} from "./features/blogs/blogs.query-repo-mongo";
import {Blog, BlogSchema,} from "./features/blogs/models/domain/blogs.domain-entities";
import {MapBlogViewModelMongo} from "./features/blogs/helpers/map-BlogViewModelMongo";
import {PostsRepoMongo} from "./features/posts/posts.repo-mongo";
import {PostsQueryRepoMongo} from "./features/posts/posts.query-repo-mongo";
import {MapPostViewModelMongo} from "./features/posts/helpers/map-PostViewModel-mongo";
import {TestingController} from "./features/testing/testing.controller";
import {CommentsController} from "./features/comments/comments.controller";
import {CommentsRepoMongo} from "./features/comments/comments.repo-mongo";
import {CommentsQueryRepoMongo} from "./features/comments/comments.query-repo-mongo";
import {MapCommentViewModelMongo} from "./features/comments/helpers/map-CommentViewModel-mongo";
import {Post, PostSchema,} from "./features/posts/models/domain/posts.domain-entities";
import {Comment, CommentSchema,} from "./features/comments/models/domain/comments.domain-entities";
import {LikesQueryRepoMongo} from "./features/likes/likes.query-repo-mongo";
import {UsersController} from "./features/users/users.controller";
import {UsersRepoMongo} from "./features/users/users.repo-mongo";
import {MapUserViewModelMongo} from "./features/users/helpers/map-UserViewModel-mongo";
import {User, UserSchema,} from "./features/users/models/domain/users.domain-entities";
import {ConfigModule} from "@nestjs/config";
import {
    Like,
    LikeSchema,
    UsersLikesConnection,
    UsersLikesConnectionSchema,
} from "./features/likes/models/domain/likes.domain-entities";
import * as process from "process";
import {AuthController} from "./features/auth/auth.controller";
import {JwtService} from "./infrastructure/jwt/jwt.service";
import {SessionsRepoMongo} from "./features/auth/sessions.repo-mongo";
import {Session, SessionSchema,} from "./features/auth/models/domain/session.domain-entities";
import {BasicStrategy} from "./features/auth/strategies/basic.strategy";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./features/auth/strategies/jwt.strategy";
import {LocalStrategy} from "./features/auth/strategies/local.strategy";
import {LikesRepoMongo} from "./features/likes/likes.repo-mongo";
import {MapLikeViewModelMongo} from "./features/likes/helpers/map-likesViewModel-mongo";
import {ExistingBlogConstraint} from "./features/posts/guards/CustomDoesBlogExist-forClassValidator";
import {CreateBlogUseCase} from "./features/blogs/use-cases/CreateBlogUseCase";
import {UpdateBlogUseCase} from "./features/blogs/use-cases/UpdateBlogUseCase";
import {DeleteBlogUseCase} from "./features/blogs/use-cases/DeleteBlogUseCase";
import {CreatePostUseCase} from "./features/posts/use-cases/CreatePostUseCase";
import {UpdatePostUseCase} from "./features/posts/use-cases/UpdatePostUseCase";
import {DeletePostUseCase} from "./features/posts/use-cases/DeletePostUseCase";
import {LikeOperationUseCase} from "./features/likes/use-cases/LikeOperationUseCase";
import {CreateCommentUseCase} from "./features/comments/use-cases/CreateCommentUseCase";
import {UpdateCommentUseCase} from "./features/comments/use-cases/UpdateCommentUseCase";
import {DeleteCommentUseCase} from "./features/comments/use-cases/DeleteCommentUseCase";
import {CreateUserUseCase} from "./features/users/use-cases/CreateUserUseCase";
import {DeleteUserUseCase} from "./features/users/use-cases/DeleteUserUseCase";
import {CheckCredentialsUseCase} from "./features/auth/use-cases/CheckCredentialsUseCase";
import {ConfirmEmailUseCase} from "./features/auth/use-cases/ConfirmEmailUseCase";
import {ResendEmailUseCase} from "./features/auth/use-cases/ResendEmailUseCase";
import {RegisterSessionUseCase} from "./features/auth/use-cases/RegisterSessionUseCase";
import {CqrsModule} from "@nestjs/cqrs";
import {DeleteSessionUseCase} from "./features/auth/use-cases/DeleteSessionUseCase";
import {SessionsQueryRepoMongo} from "./features/auth/sessions.query-repo-mongo";
import {MapSessionViewModelMongo} from "./features/auth/helpers/map-SessionViewModel-mongo";
import {RecoveryPasswordUseCase} from "./features/auth/use-cases/RecoveryPasswordUseCase";
import {UpdatePasswordUseCase} from "./features/auth/use-cases/UpdatePasswordUseCase";
import {ThrottlerModule} from "@nestjs/throttler";
import {UpdateSessionUseCase} from "./features/auth/use-cases/UpdateSessionUseCase";
import {DeleteAllSessionsUseCase} from "./features/security/use-cases/DeleteAllSessionsUseCase";
import {DeleteDeviceSessionsUseCase} from "./features/security/use-cases/DeleteDeviceSessionsUseCase";
import {SecurityController} from "./features/security/security.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MapUserViewModelSQL} from "./features/users/helpers/map-UserViewModel-sql";
import {UsersQueryRepoMongo} from "./features/users/users.query-repo-mongo";
import {UsersQueryRepoSQL} from "./features/users/users.query-repo-sql";
import {UsersRepoSQL} from "./features/users/users.repo-sql";
import {SessionsRepoSQL} from "./features/auth/sessions.repo-sql";
import {SessionsQueryRepoSQL} from "./features/auth/sessions.query.repo-sql";
import {MapSessionViewModelSQL} from "./features/auth/helpers/map-SessionViewModel-SQL";
import {BlogsControllerSa} from "./features/blogs/blogs.controller-sa";
import {MapBlogViewModelSQL} from "./features/blogs/helpers/map-BlogViewModelSQL";
import {BlogsQueryRepoSQL} from "./features/blogs/blogs.query-repo-sql";
import {BlogsController} from "./features/blogs/blogs.controller";
import {BlogsRepoSQL} from "./features/blogs/blogs.repo-sql";
import {MapPostViewModelSQL} from "./features/posts/helpers/map-PostViewModel-SQL";
import {PostsRepoSQL} from "./features/posts/posts.repo-sql";
import {PostsQueryRepoSQL} from "./features/posts/posts.query-repo-sql";
import {LikesRepoSQL} from "./features/likes/likes.repo-sql";
import {LikesQueryRepoSQL} from "./features/likes/likes.query-repo-sql";
import {MapLikeViewModelSQL} from "./features/likes/helpers/map-likesViewModel-sql";
import {CommentsQueryRepoSQL} from "./features/comments/comments.query-repo-sql";
import {CommentsRepoSQL} from "./features/comments/comments.repo-sql";
import {MapCommentViewModelSQL} from "./features/comments/helpers/map-CommentViewModel-sql";
import {MailModule} from "./infrastructure/mail/mail.module";
import {join} from "path";
import {LikeInfoEntity, UsersLikesConnectionEntity} from "./features/likes/entities/likes.entities";
import {PostsController} from "./features/posts/posts.controller";
import { PairQuizGameController } from './features/pairquizgame/pairquizgame.controller';
import {QuizQuestionsController} from './features/quizquestions/quizquestions.controller';
import {ActivePairEntity, FinishedPairEntity} from "./features/pairquizgame/entities/quiz-pair.entities";
import {QuestionEntity} from "./features/quizquestions/entities/quiz-question.entities";
import {SendAnswerQuizUseCase} from "./features/pairquizgame/use-cases/SendAnswerQuizUseCase";
import {ConnectToQuizUseCase} from "./features/pairquizgame/use-cases/ConnectToQuizUseCase";
import {PairQuizQueryRepoSQL} from "./features/pairquizgame/pairquizgame.query-repo";
import {PairQuizRepoSQL} from "./features/pairquizgame/pairquizgame.repo";
import {QuestionQuizQueryRepoSQL} from "./features/quizquestions/quizquestions.query-repo";
import {QuestionQuizRepoSQL} from "./features/quizquestions/quizquestions.repo";
import {MapPairViewModelSQL} from "./features/pairquizgame/helpers/map-PairViewModelSQL";
import {CreateQuestionUseCase} from "./features/quizquestions/use-cases/CreateQuestionUseCase";
import {DeleteQuestionUseCase} from "./features/quizquestions/use-cases/DeleteQuestionUseCase";
import {
    UpdateQuestionPublicationStatusUseCase
} from "./features/quizquestions/use-cases/UpdateQuestionPublicationStatusUseCase";
import {UpdateQuestionUseCase} from "./features/quizquestions/use-cases/UpdateQuestionUseCase";
import {MapQuestionViewModelSQL} from "./features/quizquestions/helpers/map-QuestionViewModel";

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
    // Quiz
    SendAnswerQuizUseCase,
    ConnectToQuizUseCase,
    CreateQuestionUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionPublicationStatusUseCase,
    UpdateQuestionUseCase,
]

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                ttl: 10000,
                // Временно отключаю IP retriction
                limit: 500,
            },
        ]),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URL!),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'ep-morning-queen-33268778.us-east-2.aws.neon.tech',
            port: 5432,
            username: process.env.PG_NAME,
            password: process.env.PG_PASS,
            database: 'blog_nest',
            autoLoadEntities: true,
            synchronize: true,
            ssl: true,
            logging: true,
            entities: [join(__dirname, '**', '*.entities.{ts,js}')]
        }),
        TypeOrmModule.forFeature([LikeInfoEntity, UsersLikesConnectionEntity,ActivePairEntity,FinishedPairEntity,QuestionEntity]),
        PassportModule,
        MongooseModule.forFeature([
            {name: Blog.name, schema: BlogSchema},
            {name: Post.name, schema: PostSchema},
            {name: Comment.name, schema: CommentSchema},
            {name: User.name, schema: UserSchema},
            {name: Like.name, schema: LikeSchema},
            {name: UsersLikesConnection.name, schema: UsersLikesConnectionSchema},
            {name: Session.name, schema: SessionSchema},
        ]),
        CqrsModule,
        MailModule,
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
        PairQuizGameController,
        QuizQuestionsController,
    ],
    providers: [
        AppService,
        // Blogs
        BlogsRepoMongo,
        BlogsRepoSQL,
        BlogsQueryRepoMongo,
        BlogsQueryRepoSQL,
        MapBlogViewModelMongo,
        MapBlogViewModelSQL,
        // Posts
        PostsRepoMongo,
        PostsRepoSQL,
        PostsQueryRepoMongo,
        PostsQueryRepoSQL,
        MapPostViewModelMongo,
        MapPostViewModelSQL,
        // Comments
        CommentsRepoMongo,
        CommentsQueryRepoMongo,
        CommentsQueryRepoSQL,
        CommentsRepoSQL,
        MapCommentViewModelMongo,
        MapCommentViewModelSQL,
        // Likes
        LikesQueryRepoMongo,
        LikesQueryRepoSQL,
        LikesRepoMongo,
        LikesRepoSQL,
        MapLikeViewModelMongo,
        MapLikeViewModelSQL,
        // Users
        UsersQueryRepoMongo,
        UsersQueryRepoSQL,
        UsersRepoMongo,
        UsersRepoSQL,
        MapUserViewModelMongo,
        MapUserViewModelSQL,
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
        // Quiz
        PairQuizQueryRepoSQL,
        PairQuizRepoSQL,
        QuestionQuizQueryRepoSQL,
        QuestionQuizRepoSQL,
        MapPairViewModelSQL,
        MapQuestionViewModelSQL,
        /// UseCases
        ...useCases,
    ],
})
export class AppModule {
}
