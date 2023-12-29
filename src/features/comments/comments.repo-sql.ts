import {Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {CommentCreateModel, CommentUpdateModel,} from './models/comments.models-sql';
import {v4 as uuidv4} from 'uuid';
import {CommentEntity} from "./entities/coments.entities";

@Injectable()
export class CommentsRepoSQL {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async createComment(dto: CommentCreateModel) {
        const id = uuidv4();
        try {
            const comment = new CommentEntity();
            comment.id = id;
            comment.postId = dto.postId;
            comment.content = dto.content;
            comment.userId = dto.userId;
            comment.userLogin = dto.userLogin;
            comment.createdAt = new Date();

            await this.dataSource.getRepository(CommentEntity).save(comment);

        } catch (e) {
            console.log(e);
            return null;
        }
        return id;
    }

    async updateComment(commentId: string, updateDTO: CommentUpdateModel) {
        try {
            // Найти существующий комментарий
            const comment = await this.dataSource.getRepository(CommentEntity).findOneBy({id: commentId});

            if (comment) {
                // Обновить содержание комментария
                comment.content = updateDTO.content;

                // Сохранить обновленный комментарий
                await this.dataSource.getRepository(CommentEntity).save(comment);
            }

        } catch (e) {
            console.log(e);
            return false;
        }

        const updatedComment = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("b")
            .select("id")
            .where("b.id = :id AND b.content = :content", {
                id: commentId,
                content: updateDTO.content
            })
            .getOne();

        console.log(new Date().toISOString());
        return updatedComment !== null;
    }

    async findCommentById(commentId: string): Promise<CommentEntity | null> {
        const foundComment = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("c")
            .select(["c.id", "c.postId", "c.content", "c.userId", "c.userLogin", "c.createdAt"])
            .where("c.id = :id", {id: commentId})
            .getOne();

        return foundComment
    }

    async deleteComment(commentId: string): Promise<boolean> {
        try {
            // Удаление комментария
            await this.dataSource.getRepository(CommentEntity)
                .createQueryBuilder()
                .delete()
                .from(CommentEntity)
                .where("id = :id", {id: commentId})
                .execute();
        } catch (e) {
            console.log(e);
            return false;
        }

        // Проверка, был ли комментарий удален
        const deletedComment = await this.dataSource.getRepository(CommentEntity)
            .createQueryBuilder("c")
            .select("c.id")
            .where("c.id = :id", {id: commentId})
            .getOne();

        return deletedComment === null;

    }
}
