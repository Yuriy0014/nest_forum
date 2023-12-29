import {Injectable} from '@nestjs/common';
import {BlogFilterModel} from './helpers/filter';
import {BlogViewModel} from './models/blogs.models-sql';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {MapBlogViewModelSQL} from './helpers/map-BlogViewModelSQL';
import {BlogEntity} from "./entities/blogs.entities";

@Injectable()
export class BlogsQueryRepoSQL {
    constructor(
        private readonly mapBlogViewModel: MapBlogViewModelSQL,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
    }

    async findBlogById(id: string): Promise<BlogViewModel | null> {
        const blog = await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder("b")
            .select(["b.id", "b.name", "b.description", "b.websiteUrl", "b.createdAt", "b.isMembership"])
            .where("b.id = :id", {id})
            .getOne();

        if (blog) {
            return this.mapBlogViewModel.getBlogViewModel(blog);
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

        const rawBlogs = await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder("b")
            .select(["b.id", "b.name", "b.description", "b.websiteUrl", "b.createdAt", "b.isMembership"])
            .where("b.name ILIKE :name", {name: name_like})
            .orderBy(orderByClause) // Убедитесь, что orderByClause правильно форматирован
            .limit(queryFilter.pageSize)
            .offset(queryFilter.pageSize * (queryFilter.pageNumber - 1))
            .getMany();


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
