import { Injectable } from '@nestjs/common';
import { PostFilterModel } from './helpers/filter';
import { PostDbModel } from './models/posts.models-sql';
import { MapPostViewModelSQL } from './helpers/map-PostViewModel-SQL';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepoSQL {
  constructor(
    private readonly mapPostViewModel: MapPostViewModelSQL,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async FindAllPost(queryFilter: PostFilterModel, userId?: string) {
    const validSortFields = [
      'id',
      'title',
      'shortDescription',
      'content',
      'blogId',
      'blogName',
      'createdAt',
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

    const foundPostsSQL = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt"
        FROM public.posts p
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

    /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
    const foundPostsFunction = (postArr: PostDbModel[]) => {
      const promises = postArr.map(
        async (value) =>
          await this.mapPostViewModel.getPostViewModel(value, userId),
      );
      return Promise.all(promises);
    };

    const foundPosts = await foundPostsFunction(foundPostsSQL);

    const totalCount = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt"
        FROM public.posts p
        WHERE "name" ILIKE $1
        ORDER BY ${orderByClause}
        `,
      [name_like],
    );

    return {
      pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
      page: queryFilter.pageNumber,
      pageSize: queryFilter.pageSize,
      totalCount: totalCount,
      items: foundPosts,
    };
  }

  async findPostById(id: string, userId?: string) {
    const post: PostDbModel[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt"
        FROM public.posts p
        WHERE (p."id" = $1);`,
      [id],
    );
    if (post[0]) {
      return this.mapPostViewModel.getPostViewModel(post[0], userId);
    } else {
      return null;
    }
  }
}
