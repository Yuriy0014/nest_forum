import { BlogCreateModel } from '../models/blogs.models-mongo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MapBlogViewModelSQL } from '../helpers/map-BlogViewModelSQL';
import { BlogsRepoSQL } from '../blogs.repo-sql';
import { BlogViewModel } from '../models/blogs.models-sql';

export class CreateBlogCommand {
  constructor(public BlogCreateModelDTO: BlogCreateModel) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private readonly blogsRepo: BlogsRepoSQL,
    private readonly mapBlogViewModel: MapBlogViewModelSQL,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Result<BlogViewModel>> {
    const blogId = await this.blogsRepo.createBlog(command.BlogCreateModelDTO);
    if (!blogId) {
      return {
        resultCode: ResultCode.internalServerError,
        data: null,
        errorMessage: 'Возникла ошибка при создании блога',
      };
    }
    const createdBlog = await this.blogsRepo.findBlogById(blogId);
    if (!createdBlog) {
      return {
        resultCode: ResultCode.internalServerError,
        data: null,
        errorMessage: 'Возникла ошибка при получении созданного блога',
      };
    }
    return {
      resultCode: ResultCode.success,
      data: this.mapBlogViewModel.getBlogViewModel(createdBlog),
    };
  }
}
