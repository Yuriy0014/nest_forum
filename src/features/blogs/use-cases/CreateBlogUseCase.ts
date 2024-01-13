import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MapBlogViewModelSQL } from '../helpers/map-BlogViewModelSQL';
import { BlogsRepoSQL } from '../blogs.repo-sql';
import { BlogViewModel, BlogCreateModel } from '../models/blogs.models-sql';
import { Result } from '../../helpers/result_types';
import {HttpStatus} from "@nestjs/common";

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
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при создании блога',
            };
        }
        const createdBlog = await this.blogsRepo.findBlogById(blogId);
        if (!createdBlog) {
            return {
                resultCode: HttpStatus.INTERNAL_SERVER_ERROR,
                data: null,
                errorMessage: 'Возникла ошибка при получении созданного блога',
            };
        }
        return {
            resultCode: HttpStatus.OK,
            data: this.mapBlogViewModel.getBlogViewModel(createdBlog),
        };
    }
}
