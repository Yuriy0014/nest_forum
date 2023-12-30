import {Injectable} from '@nestjs/common';
import {MapCommentViewModelSQL} from './helpers/map-CommentViewModel-sql';
import {CommentsFilterModel} from './models/comments.models-sql';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CommentEntity} from "./entities/coments.entities";

@Injectable()
export class CommentsQueryRepoSQL {
    constructor(
        @InjectDataSource() protected dataSource: DataSource,
        private readonly mapCommentViewModel: MapCommentViewModelSQL,
    ) {
    }

    async findCommentById(commentId: string, userId?: string) {
        const foundComment = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("c")
            .select(["c.id", "c.postId", "c.content", "c.userId", "c.userLogin", "c.createdAt"])
            .where("c.id = :id", {id: commentId})
            .getOne();

        if (foundComment) {
            return this.mapCommentViewModel.getCommentViewModel(
                foundComment,
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

        const orderByField = `c.${queryFilter.sortBy}`;
        const orderByDirection = queryFilter.sortDirection;


        const rawCommentsSQL = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("c")
            .select([
                "c.id",
                "c.postId",
                "c.content",
                "c.userId",
                "c.userLogin",
                "c.createdAt"
            ])
            .where("c.postId = :postId", {postId: queryFilter.postId})
            .orderBy(orderByField, orderByDirection) //
            .limit(queryFilter.pageSize)
            .offset(queryFilter.pageSize * (queryFilter.pageNumber - 1))
            .getMany();


        /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
        const foundCommentsFunction = (commArr: CommentEntity[]) => {
            const promises = commArr.map(
                async (value) =>
                    await this.mapCommentViewModel.getCommentViewModel(value, userId),
            );
            return Promise.all(promises);
        };

        const foundComments = await foundCommentsFunction(rawCommentsSQL);

        const totalComments = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("c")
            .select("c.id")
            .where("c.postId = :postId", {postId: queryFilter.postId})
            .getMany();


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
