import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  BlogCreateModel,
  BlogDbModel,
  BlogUpdateModel,
} from './models/blogs.models-sql';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlogsRepoSQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(dto: BlogCreateModel): Promise<string | null> {
    const id = uuidv4();
    try {
      await this.dataSource.query(
        `
    INSERT INTO public.blogs(
    "id",
    "name", "description", "websiteUrl", "createdAt", 
    "isMembership")
     VALUES ($1, $2, $3, $4, $5, $6);
    `,
        [id, dto.name, dto.description, dto.websiteUrl, new Date(), false],
      );
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
      await this.dataSource.query(
        `
        UPDATE public.blogs
        SET "name"=$1, "description"=$2, "websiteUrl"=$3
        WHERE "id" = $4;
    `,
        [updateDTO.name, updateDTO.description, updateDTO.websiteUrl, blogId],
      );
    } catch (e) {
      console.log(e);
      return false;
    }

    const updatedBlog: BlogDbModel[] = await this.dataSource.query(
      `
        SELECT b."id"
        FROM public.blogs b
        WHERE (b."id" = $1 AND b."name"=$2 AND b."description"=$3 AND b."websiteUrl"=$4);`,
      [blogId, updateDTO.name, updateDTO.description, updateDTO.websiteUrl],
    );

    return updatedBlog.length !== 0;
  }

  async deleteBlog(blogId: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM public.blogs
        WHERE id = $1`,
      [blogId],
    );

    const deletedBlog = await this.dataSource.query(
      `
        SELECT b."id"
        FROM public."blogs" b
        WHERE b."id" = $1`,
      [blogId],
    );

    return deletedBlog.length === 0;
  }

  async findBlogById(id: string): Promise<BlogDbModel | null> {
    const blog: BlogDbModel[] = await this.dataSource.query(
      `
        SELECT b."id", b."name", b."description", b."websiteUrl", b."createdAt", b."isMembership"
        FROM public.blogs b
        WHERE (b."id" = $1);`,
      [id],
    );
    if (blog[0]) {
      return blog[0];
    } else {
      return null;
    }
  }
}
