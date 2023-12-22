import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CommentDbModel,
  CommentUpdateModel,
} from './models/comments.models-sql';
import { CommentCreateModel } from './models/comments.models-sql';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentsRepoSQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createComment(dto: CommentCreateModel) {
    const id = uuidv4();
    try {
      await this.dataSource.query(
        `
                    INSERT INTO public.comments("id", "postId", content, "userId", "userLogin", "createdAt")
                    VALUES ($1, $2, $3, $4, $5, $6);`,
        [id, dto.postId, dto.content, dto.userId, dto.userLogin, new Date()],
      );
    } catch (e) {
      console.log(e);
      return null;
    }
    return id;
  }

  async updateComment(commentId: string, updateDTO: CommentUpdateModel) {
    try {
      await this.dataSource.query(
        `
                    UPDATE public.comments
                    SET "content"=$1
                    WHERE "id" = $2;
                `,
        [updateDTO.content, commentId],
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    const updatedComment: CommentDbModel[] = await this.dataSource.query(
      `
                SELECT "id"
                FROM public.comments b
                WHERE ("id" = $1 AND "content" = $2);`,
      [commentId, updateDTO.content],
    );

    return updatedComment.length !== 0;
  }

  async findCommentById(commentId: string): Promise<CommentDbModel | null> {
    const foundComment: CommentDbModel = await this.dataSource.query(
      `
                SELECT id, "postId", content, "userId", "userLogin", "createdAt"
                FROM public."comments"
                WHERE ("id" = $1)`,
      [commentId],
    );
    if (foundComment[0]) {
      return foundComment[0];
    } else {
      return null;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
                    DELETE
                    FROM public.comments
                    WHERE id = $1`,
        [commentId],
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    const deletedComment = await this.dataSource.query(
      `
                SELECT c."id"
                FROM public."comments" c
                WHERE c."id" = $1`,
      [commentId],
    );

    return deletedComment.length === 0;
  }
}
