import {Injectable} from '@nestjs/common';
import {
    PostCreateModelFromBlog,
    PostUpdateModel,
} from './models/posts.models-sql';
import {v4 as uuidv4} from 'uuid';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {PostEntity} from "./entities/posts.entities";

@Injectable()
export class PostsRepoSQL {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async createPost(
        dto: PostCreateModelFromBlog,
        blogName: string,
    ): Promise<string | null> {
        const id = uuidv4();
        try {
            const post = new PostEntity();
            post.id = id;
            post.title = dto.title;
            post.shortDescription = dto.shortDescription;
            post.content = dto.content;
            post.blogId = dto.blogId;
            post.blogName = blogName;
            post.createdAt = new Date();

            await this.dataSource.getRepository(PostEntity).save(post);

        } catch (e) {
            console.log(e);
            return null;
        }
        return id;
    }

    async updatePost(
        blogId: string,
        postId: string,
        updateDTO: PostUpdateModel,
    ): Promise<boolean> {
        try {
            // Найти существующий пост
            const post = await this.dataSource.getRepository(PostEntity).findOneBy({id: postId});

            if (post) {
                // Обновить поля поста
                post.title = updateDTO.title;
                post.shortDescription = updateDTO.shortDescription;
                post.content = updateDTO.content;
                post.blogId = blogId;

                // Сохранить обновленный пост
                await this.dataSource.getRepository(PostEntity).save(post);
            }

        } catch (e) {
            console.log(e);
            return false;
        }

        const updatedPost = await this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select("p.id")
            .where("p.id = :id AND p.title = :title AND p.shortDescription = :shortDescription AND p.content = :content AND p.blogId = :blogId", {
                id: postId,
                title: updateDTO.title,
                shortDescription: updateDTO.shortDescription,
                content: updateDTO.content,
                blogId: blogId
            })
            .getOne();


        return updatedPost == null;
    }

    async deletePost(postId: string) {
        // Удаление поста
        await this.dataSource.getRepository(PostEntity)
            .createQueryBuilder()
            .delete()
            .from(PostEntity)
            .where("id = :id", {id: postId})
            .execute();

        // Проверка, был ли пост удален
        const deletedPost = await this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select("p.id")
            .where("p.id = :id", {id: postId})
            .getOne();

        return deletedPost === null;

    }

    async findPostById(id: string) {
        const post = await this.dataSource.getRepository(PostEntity)
            .createQueryBuilder("p")
            .select(["p.id", "p.title", "p.shortDescription", "p.content", "p.blogId", "p.blogName", "p.createdAt"])
            .where("p.id = :id", {id})
            .getOne();

        if (post) {
            return post;
        } else {
            return null;
        }
    }
}
