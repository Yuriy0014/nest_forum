import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../models/domain/blogs.domain-entities';
import { BlogsRepoMongo } from '../blogs.repo-mongo';
import { MapBlogViewModelMongo } from '../helpers/map-BlogViewModelMongo';
import { BlogCreateModel } from '../models/blogs.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public BlogCreateModelDTO: BlogCreateModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepoMongo,
    private readonly mapBlogViewModel: MapBlogViewModelMongo,
  ) {}

  async execute(command: CreateBlogCommand) {
    const createdBlog = this.blogModel.createBlog(
      command.BlogCreateModelDTO,
      this.blogModel,
    );

    await this.blogsRepo.save(createdBlog);
    return this.mapBlogViewModel.getBlogViewModel(createdBlog);
  }
}
