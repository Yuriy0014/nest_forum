import { Injectable } from '@nestjs/common';
import {
  PostCreateModelStandart,
  PostDbModel,
  PostUpdateModel,
} from './models/posts.models-sql';
import { v4 as uuidv4 } from 'uuid';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepoSQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(
    dto: PostCreateModelStandart,
    blogName: string,
  ): Promise<string | null> {
    const id = uuidv4();
    try {
      await this.dataSource.query(
        `
    INSERT INTO public.posts(
    "id",
    "title", "shortDescription", "content", "blogId", 
    "blogName","createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
        [
          id,
          dto.title,
          dto.shortDescription,
          dto.content,
          dto.blogId,
          blogName,
          new Date(),
        ],
      );
    } catch (e) {
      console.log(e);
      return null;
    }
    return id;
  }

  async updatePost(
    postId: string,
    updateDTO: PostUpdateModel,
  ): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
        UPDATE public.posts
        SET "title"=$1, "shortDescription"=$2, "content"=$3,"blogId"=$4
        WHERE "id" = $5;
    `,
        [
          updateDTO.title,
          updateDTO.shortDescription,
          updateDTO.content,
          updateDTO.blogId,
          postId,
        ],
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    const updatedPost: PostDbModel[] = await this.dataSource.query(
      `
        SELECT p."id"
        FROM public.posts p
        WHERE (p."id" = $1 AND p."title"=$2 AND p."shortDescription"=$3 AND p."content"=$4 AND p."blogId" = $5);`,
      [
        postId,
        updateDTO.title,
        updateDTO.shortDescription,
        updateDTO.content,
        updateDTO.blogId,
      ],
    );

    return updatedPost.length !== 0;
  }

  async deletePost(postId: string) {
    await this.dataSource.query(
      `
        DELETE FROM public.posts
        WHERE id = $1`,
      [postId],
    );

    const deletedPost = await this.dataSource.query(
      `
        SELECT p."id"
        FROM public."posts" p
        WHERE p."id" = $1`,
      [postId],
    );

    return deletedPost.length === 0;
  }

  async findPostById(id: string) {
    const post: PostDbModel[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."blogName", p."createdAt"
        FROM public.posts p
        WHERE (p."id" = $1);`,
      [id],
    );
    if (post[0]) {
      return post[0];
    } else {
      return null;
    }
  }
}
