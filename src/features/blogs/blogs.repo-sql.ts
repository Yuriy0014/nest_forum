import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {
    BlogCreateModel,
    BlogUpdateModel,
} from './models/blogs.models-sql';
import {v4 as uuidv4} from 'uuid';
import {BlogEntity} from "./entities/blogs.entities";

@Injectable()
export class BlogsRepoSQL {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async createBlog(dto: BlogCreateModel): Promise<string | null> {
        const id = uuidv4();
        try {
            const blog = new BlogEntity();
            blog.id = id;
            blog.name = dto.name;
            blog.description = dto.description;
            blog.websiteUrl = dto.websiteUrl;
            blog.createdAt = new Date();
            blog.isMembership = false;

            await this.dataSource.getRepository(BlogEntity).save(blog);
        } catch (e) {
            console.log(e);
            return null;
        }
        return id;
    }

    async updateBlog(
        blogId: string,
        updateDTO: BlogUpdateModel,
    ): Promise<boolean> {
        try {
            // Найти существующий блог
            const blog = await this.dataSource.getRepository(BlogEntity).findOneBy({id: blogId});

            if (blog) {
                // Обновить поля блога
                blog.name = updateDTO.name;
                blog.description = updateDTO.description;
                blog.websiteUrl = updateDTO.websiteUrl;

                // Сохранить обновленный блог
                await this.dataSource.getRepository(BlogEntity).save(blog);
            }
        } catch (e) {
            console.log(e);
            return false;
        }

        const updatedBlog = await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder("b")
            .select(["b.id"])
            .where("b.id = :id AND b.name = :name AND b.description = :description AND b.websiteUrl = :websiteUrl", {
                id: blogId,
                name: updateDTO.name,
                description: updateDTO.description,
                websiteUrl: updateDTO.websiteUrl
            })
            .getMany();

        return updatedBlog.length !== 0;
    }

    async deleteBlog(blogId: string): Promise<boolean> {
        await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder()
            .delete()
            .from(BlogEntity)
            .where("id = :id", {id: blogId})
            .execute();


        const deletedBlog = await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder("b")
            .select("b.id")
            .where("b.id = :id", {id: blogId})
            .getOne();


        return deletedBlog === null;
    }

    async findBlogById(id: string): Promise<BlogEntity | null> {
        const blog = await this.dataSource.getRepository(BlogEntity)
            .createQueryBuilder("b")
            .select(["b.id", "b.name", "b.description", "b.websiteUrl", "b.createdAt", "b.isMembership"])
            .where("b.id = :id", {id})
            .getOne();

        if (blog) {
            return blog;
        } else {
            return null;
        }
    }
}
