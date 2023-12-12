import { InjectModel } from '@nestjs/mongoose';
import { Post, postModelType } from '../models/domain/posts.domain-entities';
import {
  Like,
  LikeModelType,
  LikeObjectTypeEnum,
} from '../../likes/models/domain/likes.domain-entities';
import { PostsRepoMongo } from '../posts.repo-mongo';
import { LikesRepo } from '../../likes/likes.repo';
import { BlogsQueryRepoMongo } from '../../blogs/blogs.query-repo-mongo';
import { MapPostViewModelMongo } from '../helpers/map-PostViewModel-mongo';
import { PostCreateModelStandart } from '../models/posts.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public PostCreateModelDTO: PostCreateModelStandart) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    private readonly postsRepo: PostsRepoMongo,
    private readonly likesRepo: LikesRepo,
    private readonly blogsQueryRepo: BlogsQueryRepoMongo,
    private readonly mapPostViewModel: MapPostViewModelMongo,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsQueryRepo.findBlogById(
      command.PostCreateModelDTO.blogId,
    );

    const createdPost = this.postModel.createPost(
      command.PostCreateModelDTO,
      blog!.name,
      this.postModel,
    );

    const newLikesInfo = this.likeModel.createLikesInfo(
      createdPost._id.toString(),
      LikeObjectTypeEnum.Post,
      this.likeModel,
    );

    await this.likesRepo.save(newLikesInfo);

    await this.postsRepo.save(createdPost);
    return this.mapPostViewModel.getPostViewModel(createdPost);
  }
}
