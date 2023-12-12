import { Injectable } from '@nestjs/common';
import {
  likeDBModel,
  LikeObjectTypeEnum,
  likeStatus,
  usersLikesConnectionDBModel,
} from './models/likes.models-sql';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepoSQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async Like(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const likesIfoInstance: likeDBModel[] = await this.dataSource.query(
      `
        SELECT  l."likesCount"
        FROM public.likes l
        WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
      [ownerId, ownerType],
    );
    if (!likesIfoInstance) return false;

    try {
      // Увеличиваем количество лайков на 1
      await this.dataSource.query(
        `
        UPDATE public.likes
        SET "likesCount"=$3
        WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
        [ownerId, ownerType, likesIfoInstance[0].likesCount + 1],
      );

      const userStatusInstance: usersLikesConnectionDBModel[] =
        await this.dataSource.query(
          `
        SELECT c."id"
        FROM public.usersLikesConnection c
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [userId, ownerId, ownerType],
        );

      // Если пользователь никогда раньше лайк не ставил - в таблице нет записи и нам нужно ее создать
      if (!userStatusInstance[0]) {
        await this.dataSource.query(
          `
        INSERT INTO public."usersLikesConnection"(
        "userId", "userLogin", "addedAt", "likedObjectId", "likedObjectType", "status")
        VALUES ($1 $2, $3, $4, $5, $6, $7);`,
          [userId, ownerId, ownerType, userLogin, new Date(), likeStatus.Like],
        );
      } else {
        await this.dataSource.query(
          `
        UPDATE public."usersLikesConnection"
        SET "status"=$1
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [likeStatus.Like, userId, ownerId, ownerType],
        );
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async Dislike(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    const likesIfoInstance: likeDBModel[] = await this.dataSource.query(
      `
        SELECT  l."dislikesCount"
        FROM public.likes l
        WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
      [ownerId, ownerType],
    );
    if (!likesIfoInstance) return false;

    try {
      // Увеличиваем количество дизлайков на 1
      await this.dataSource.query(
        `
        UPDATE public.likes
        SET "dislikesCount"=$3
        WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
        [ownerId, ownerType, likesIfoInstance[0].dislikesCount + 1],
      );

      const userStatusInstance: usersLikesConnectionDBModel[] =
        await this.dataSource.query(
          `
        SELECT c."id"
        FROM public.usersLikesConnection c
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [userId, ownerId, ownerType],
        );

      // Если пользователь никогда раньше лайк не ставил - в таблице нет записи и нам нужно ее создать
      if (!userStatusInstance[0]) {
        await this.dataSource.query(
          `
        INSERT INTO public."usersLikesConnection"(
        "userId", "userLogin", "addedAt", "likedObjectId", "likedObjectType", "status")
        VALUES ($1 $2, $3, $4, $5, $6, $7);`,
          [
            userId,
            ownerId,
            ownerType,
            userLogin,
            new Date(),
            likeStatus.Dislike,
          ],
        );
      } else {
        await this.dataSource.query(
          `
        UPDATE public."usersLikesConnection"
        SET "status"=$1
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [likeStatus.Dislike, userId, ownerId, ownerType],
        );
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async Reset(
    ownerType: LikeObjectTypeEnum,
    ownerId: string,
    userId: string,
    userLogin: string,
    savedStatus: string,
  ): Promise<boolean> {
    const likesIfoInstance: likeDBModel[] = await this.dataSource.query(
      `
        SELECT  l."dislikesCount"
        FROM public.likes l
        WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
      [ownerId, ownerType],
    );
    if (!likesIfoInstance) return false;

    try {
      // уменьшаем счетчик лайков/дизлайков
      let typeOfLikeForUpdate = 'None';
      if (savedStatus === likeStatus.Like) {
        typeOfLikeForUpdate = 'likesCount';
      }
      if (savedStatus === likeStatus.Dislike) {
        typeOfLikeForUpdate = 'dislikesCount';
      }
      if (typeOfLikeForUpdate !== 'None') {
        const updatedValue =
          typeOfLikeForUpdate === 'likesCount'
            ? likesIfoInstance[0].likesCount + 1
            : likesIfoInstance[0].dislikesCount + 1;

        await this.dataSource.query(
          `
                UPDATE public.likes
                SET "${typeOfLikeForUpdate}"= $3
                WHERE (l."ownerId" = $1 AND l."ownerType" = $2);`,
          [ownerId, ownerType, updatedValue],
        );
      }

      const userStatusInstance: usersLikesConnectionDBModel[] =
        await this.dataSource.query(
          `
        SELECT c."id"
        FROM public.usersLikesConnection c
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [userId, ownerId, ownerType],
        );

      // Если пользователь никогда раньше лайк не ставил - в таблице нет записи и нам нужно ее создать
      if (!userStatusInstance[0]) {
        await this.dataSource.query(
          `
        INSERT INTO public."usersLikesConnection"(
        "userId", "userLogin", "addedAt", "likedObjectId", "likedObjectType", "status")
        VALUES ($1 $2, $3, $4, $5, $6, $7);`,
          [userId, ownerId, ownerType, userLogin, new Date(), likeStatus.None],
        );
      } else {
        await this.dataSource.query(
          `
        UPDATE public."usersLikesConnection"
        SET "status"=$1
        WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
          [likeStatus.None, userId, ownerId, ownerType],
        );
      }
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
