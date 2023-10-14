import { Injectable } from '@nestjs/common';
import { BlogDbModel } from './models/blogs.models';
import { Blog, BlogModelType } from './models/domain/blogs.domain-entities';
import { getBlogViewModel } from './helpers/map-BlogViewModel';
import { InjectModel } from '@nestjs/mongoose';
import { BlogFilterModel } from './helpers/filter';
import { FilterQuery } from 'mongoose';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}

  async findBlogById(id: string) {
    const foundBlog: BlogDbModel | null = await this.blogModel
      .findById(id)
      .lean();
    if (foundBlog) {
      return getBlogViewModel(foundBlog);
    } else {
      return null;
    }
  }

  async FindAllBlog(queryFilter: BlogFilterModel) {
    const filter: FilterQuery<BlogDbModel> = {
      name: { $regex: queryFilter.searchNameTerm ?? '', $options: 'i' },
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

    const foundBlogs = foundBlogsMongoose.map((blog) => getBlogViewModel(blog));

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
