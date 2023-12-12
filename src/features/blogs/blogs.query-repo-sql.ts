import { Injectable } from '@nestjs/common';
import { BlogFilterModel } from './helpers/filter';
import { BlogDbModel } from './models/blogs.models-sql';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MapBlogViewModelSQL } from './helpers/map-BlogViewModelSQL';

@Injectable()
export class BlogsQueryRepoSQL {
  constructor(
    private readonly mapBlogViewModel: MapBlogViewModelSQL,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async findBlogById(id: string) {
    const blog: BlogDbModel[] = await this.dataSource.query(
      `
        SELECT b."id", b."name", b."description", b."websiteUrl", b."createdAt", b."isMembership"
        FROM public.blogs b
        WHERE (b."id" = $1);`,
      [id],
    );
    if (blog[0]) {
      return this.mapBlogViewModel.getBlogViewModel(blog[0]);
    } else {
      return null;
    }
  }

  async FindAllBlogs(queryFilter: BlogFilterModel) {
    const validSortFields = [
      'id',
      'name',
      'description',
      'websiteUrl',
      'createdAt',
      'isMembership',
    ];
    if (!validSortFields.includes(queryFilter.sortBy)) {
      throw new Error('Invalid sort field');
    }

    const name_like =
      queryFilter.searchNameTerm === null
        ? '%'
        : `%${queryFilter.searchNameTerm}%`;

    const orderByClause =
      '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection;

    const rawBlogs = await this.dataSource.query(
      `
        SELECT b."id", b."name", b."description", b."websiteUrl", b."createdAt", b."isMembership"
        FROM public.blogs b
        WHERE "name" ILIKE $1
        ORDER BY ${orderByClause}
        LIMIT $2
        OFFSET $3;
        `,
      [
        name_like,
        queryFilter.pageSize,
        queryFilter.pageSize * (queryFilter.pageNumber - 1),
      ],
    );

    const foundBlogs = rawBlogs.map((Blog) =>
      this.mapBlogViewModel.getBlogViewModel(Blog),
    );

    const totalBlogs = await this.dataSource.query(
      `
        SELECT b."id"
        FROM public."blogs" b
        WHERE ("name" ILIKE $1)
        ORDER BY ${orderByClause}
        `,
      [name_like],
    );

    const totalCount = totalBlogs.length;

    return {
      pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
      page: queryFilter.pageNumber,
      pageSize: queryFilter.pageSize,
      totalCount: totalCount,
      items: foundBlogs,
    };
  }
}
