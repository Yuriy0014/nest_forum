import {Injectable} from '@nestjs/common';
import {BlogDbModel} from './models/blogs.models-mongo';
import {Blog, BlogModelType} from './models/domain/blogs.domain-entities';
import {InjectModel} from '@nestjs/mongoose';
import {BlogFilterMongoModel} from './helpers/filter';
import {FilterQuery} from 'mongoose';
import {MapBlogViewModelMongo} from './helpers/map-BlogViewModelMongo';

@Injectable()
export class BlogsQueryRepoMongo {
    constructor(
        @InjectModel(Blog.name)
        private readonly blogModel: BlogModelType,
        private readonly mapPostViewModel: MapBlogViewModelMongo,
    ) {
    }

    async findBlogById(id: string) {
        const foundBlog: BlogDbModel | null = await this.blogModel
            .findById(id)
            .lean();
        if (foundBlog) {
            return this.mapPostViewModel.getBlogViewModel(foundBlog);
        } else {
            return null;
        }
    }

    async FindAllBlog(queryFilter: BlogFilterMongoModel) {
        const filter: FilterQuery<BlogDbModel> = {
            name: {$regex: queryFilter.searchNameTerm ?? '', $options: 'i'},
        };

        const sortFilter = {
            [queryFilter.sortBy]: queryFilter.sortDirection,
        };

        const foundBlogsMongoose = await this.blogModel
            .find(filter)
            .lean()
            .sort(sortFilter)
            .skip((queryFilter.pageNumber - 1) * queryFilter.pageSize)
            .limit(queryFilter.pageSize);

        const foundBlogs = foundBlogsMongoose.map((blog) =>
            this.mapPostViewModel.getBlogViewModel(blog),
        );

        const totalCount = await this.blogModel.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: totalCount,
            items: foundBlogs,
        };
    }
}
