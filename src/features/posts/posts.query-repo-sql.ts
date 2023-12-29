import {Injectable} from '@nestjs/common';
import {PostFilterModel} from './helpers/filter';
import {MapPostViewModelSQL} from './helpers/map-PostViewModel-SQL';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {PostEntity} from "./entities/posts.entities";

@Injectable()
export class PostsQueryRepoSQL {
    constructor(
        private readonly mapPostViewModel: MapPostViewModelSQL,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
    }

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

        const orderByField = `p.${queryFilter.sortBy}`;
        const orderByDirection = queryFilter.sortDirection;

        const params: any[] = [
            queryFilter.pageSize,
            queryFilter.pageSize * (queryFilter.pageNumber - 1),
        ];

        let query = this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select(["p.id", "p.title", "p.shortDescription", "p.content", "p.blogId", "p.blogName", "p.createdAt"])
            .orderBy(orderByField, orderByDirection)
            .limit(params[0])
            .offset(params[1]);

        if (queryFilter.blogId !== null) {
            query = query.where("p.blogId = :blogId", {blogId: queryFilter.blogId});
        }

        const foundPostsSQL = await query.getMany();


        /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
        const foundPostsFunction = (postArr: PostEntity[]) => {
            const promises = postArr.map(
                async (value) =>
                    await this.mapPostViewModel.getPostViewModel(value, userId),
            );
            return Promise.all(promises);
        };

        const foundPosts = await foundPostsFunction(foundPostsSQL);

        let query_total = this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select(["p.id", "p.title", "p.shortDescription", "p.content", "p.blogId", "p.blogName", "p.createdAt"]);

        if (queryFilter.blogId !== null) {
            query_total = query_total.where("p.blogId = :blogId", {blogId: queryFilter.blogId});
        }

        query_total = query_total.orderBy(orderByField, orderByDirection);

        console.log(query_total)
        const totalPostsRaw = await query_total.getMany();


        const totalCount = totalPostsRaw.length;

        return {
            pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: totalCount,
            items: foundPosts,
        };
    }

    async findPostById(id: string, userId?: string) {
        const post = await this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select(["p.id", "p.title", "p.shortDescription", "p.content", "p.blogId", "p.blogName", "p.createdAt"])
            .where("p.id = :id", {id})
            .getOne();

        if (post) {
            return this.mapPostViewModel.getPostViewModel(post, userId);
        } else {
            return null;
        }
    }
}
