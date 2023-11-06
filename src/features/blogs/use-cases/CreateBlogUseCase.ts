import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../models/domain/blogs.domain-entities';
import { BlogsRepo } from '../blogs.repo';
import { MapBlogViewModel } from '../helpers/map-BlogViewModel';
import { BlogCreateModel } from '../models/blogs.models';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public BlogCreateModelDTO: BlogCreateModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
    private readonly mapBlogViewModel: MapBlogViewModel,
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
