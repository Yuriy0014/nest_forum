import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepoSQL } from '../../blogs/blogs.query-repo-sql';
import { MapPostViewModelSQL } from '../helpers/map-PostViewModel-SQL';
import { PostsRepoSQL } from '../posts.repo-sql';
import { LikesRepoSQL } from '../../likes/likes.repo-sql';
import { LikeObjectTypeEnum } from '../../likes/models/likes.models-sql';
import { PostCreateModelFromBlog } from '../models/posts.models-sql';

export class CreatePostCommand {
    constructor(public PostCreateModelDTO: PostCreateModelFromBlog) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
    constructor(
    private readonly postsRepo: PostsRepoSQL,
    private readonly likesRepo: LikesRepoSQL,
    private readonly blogsQueryRepo: BlogsQueryRepoSQL,
    private readonly mapPostViewModel: MapPostViewModelSQL,
    ) {}

    async execute(command: CreatePostCommand) {
        const blog = await this.blogsQueryRepo.findBlogById(
            command.PostCreateModelDTO.blogId,
        );

        if (!blog) {
            return null;
        }

        const createdPostId = await this.postsRepo.createPost(
            command.PostCreateModelDTO,
            blog.name,
        );

        if (!createdPostId) {
            return null;
        }

        // Создаем информацию о лайках
        await this.likesRepo.createLikesInfo(
            createdPostId,
            LikeObjectTypeEnum.Post,
        );

        const createdPost = await this.postsRepo.findPostById(createdPostId);

        if (!createdPost) {
            return null;
        }

        return this.mapPostViewModel.getPostViewModel(createdPost);
    }
}
