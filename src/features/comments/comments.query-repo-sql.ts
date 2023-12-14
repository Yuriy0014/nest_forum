import { Injectable } from '@nestjs/common';
import { MapCommentViewModelSQL } from './helpers/map-CommentViewModel-sql';
import {
  CommentDbModel,
  CommentsFilterModel,
} from './models/comments.models-sql';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepoSQL {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private readonly mapCommentViewModel: MapCommentViewModelSQL,
  ) {}

  async findCommentById(commentId: string, userId?: string) {
    const foundComment: CommentDbModel = await this.dataSource.query(
      `
                SELECT id, "postId", content, "userId", "userLogin", "createdAt"
                FROM public."comments"
                WHERE ("id" = $1)`,
      [commentId],
    );
    if (foundComment[0]) {
      return this.mapCommentViewModel.getCommentViewModel(
        foundComment[0],
        userId,
      );
    } else {
      return null;
    }
  }

  async findComments(queryFilter: CommentsFilterModel, userId?: string) {
    const validSortFields = [
      'id',
      'postId',
      'content',
      'userId',
      'userLogin',
      'createdAt',
    ];
    if (!validSortFields.includes(queryFilter.sortBy)) {
      throw new Error('Invalid sort field');
    }

    const orderByClause =
      '"' + queryFilter.sortBy + '"' + ' ' + queryFilter.sortDirection;

    const rawCommentsSQL = await this.dataSource.query(
      `
          SELECT id, "postId", content, "userId", "userLogin", "createdAt"
          FROM public.comments
          ORDER BY ${orderByClause}
--           LIMIT $1 OFFSET $2;
      `,
      // [
      //   queryFilter.pageSize,
      //   queryFilter.pageSize * (queryFilter.pageNumber - 1),
      // ],
    );

    /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
    const foundCommentsFunction = (commArr: CommentDbModel[]) => {
      const promises = commArr.map(
        async (value) =>
          await this.mapCommentViewModel.getCommentViewModel(value, userId),
      );
      return Promise.all(promises);
    };

    const foundComments = await foundCommentsFunction(rawCommentsSQL);

    const totalComments = await this.dataSource.query(
      `
          SELECT id
          FROM public.comments
      `,
    );

    const totalCount = totalComments.length;

    return {
      pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
      page: queryFilter.pageNumber,
      pageSize: queryFilter.pageSize,
      totalCount: totalCount,
      items: foundComments,
    };
  }
}
