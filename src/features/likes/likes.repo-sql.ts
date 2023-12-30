import {Injectable} from '@nestjs/common';
import {LikeObjectTypeEnum, likeStatus} from './models/likes.models-sql';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {LikeInfoEntity, UsersLikesConnectionEntity} from "./entities/likes.entities";

@Injectable()
export class LikesRepoSQL {
    constructor(@InjectDataSource() protected dataSource: DataSource) {
    }

    async Like(
        ownerType: LikeObjectTypeEnum,
        ownerId: string,
        userId: string,
        userLogin: string,
    ): Promise<boolean> {
        try {
            const likeInfo = await this.dataSource.getRepository(LikeInfoEntity)
                .findOneBy({
                    ownerId: ownerId,
                    ownerType: ownerType
                });

            if (!likeInfo) return false;
            // Увеличиваем количество лайков на 1
            likeInfo.likesCount += 1;
            await this.dataSource.getRepository(LikeInfoEntity).save(likeInfo);

            const userStatus = await this.dataSource.getRepository(UsersLikesConnectionEntity)
                .findOneBy({
                    userId: userId,
                    likedObjectId: ownerId,
                    likedObjectType: ownerType
                });

            // Если пользователь никогда раньше лайк не ставил - в таблице нет записи и нам нужно ее создать
            if (!userStatus) {
                const newUserStatus = new UsersLikesConnectionEntity();
                newUserStatus.userId = userId;
                newUserStatus.userLogin = userLogin;
                newUserStatus.addedAt = new Date();
                newUserStatus.likedObjectId = ownerId;
                newUserStatus.likedObjectType = ownerType;
                newUserStatus.status = likeStatus.Like;
                await this.dataSource.getRepository(UsersLikesConnectionEntity).save(newUserStatus);
            } else {
                userStatus.status = likeStatus.Like;
                await this.dataSource.getRepository(UsersLikesConnectionEntity).save(userStatus);
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
        const likeInfo = await this.dataSource.getRepository(LikeInfoEntity)
            .findOneBy({
                ownerId: ownerId,
                ownerType: ownerType
            });

        if (!likeInfo) return false;

        try {
            // Увеличиваем количество дизлайков на 1
            likeInfo.dislikesCount += 1;
            await this.dataSource.getRepository(LikeInfoEntity).save(likeInfo);

            let userStatus = await this.dataSource.getRepository(UsersLikesConnectionEntity)
                .findOneBy({
                    userId: userId,
                    likedObjectId: ownerId,
                    likedObjectType: ownerType
                });

            // Если пользователь никогда раньше лайк не ставил - в таблице нет записи и нам нужно ее создать
            if (!userStatus) {
                userStatus = new UsersLikesConnectionEntity();
                userStatus.userId = userId;
                userStatus.userLogin = userLogin;
                userStatus.addedAt = new Date();
                userStatus.likedObjectId = ownerId;
                userStatus.likedObjectType = ownerType;
                userStatus.status = likeStatus.Dislike;
            } else {
                // Обновляем статус лайка на дизлайк
                userStatus.status = likeStatus.Dislike;
            }

            await this.dataSource.getRepository(UsersLikesConnectionEntity).save(userStatus);

            return true;
        } catch (e) {
            console.error(e);
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

        try {
            // Получение информации о лайках
            const likeInfo = await this.dataSource.getRepository(LikeInfoEntity).findOneBy({ownerId, ownerType});
            if (!likeInfo) return false;

            // Обновление счетчика лайков или дизлайков
            if (savedStatus === likeStatus.Like) {
                likeInfo.likesCount = likeInfo.likesCount - 1;
            } else if (savedStatus === likeStatus.Dislike) {
                likeInfo.dislikesCount = likeInfo.dislikesCount - 1;
            }

            await this.dataSource.getRepository(LikeInfoEntity).save(likeInfo);

            // Обработка статуса лайка пользователя
            let userStatus = await this.dataSource.getRepository(UsersLikesConnectionEntity).findOneBy({
                userId,
                likedObjectId: ownerId,
                likedObjectType: ownerType
            });

            if (!userStatus) {
                // Создание записи, если она не существует
                userStatus = this.dataSource.getRepository(UsersLikesConnectionEntity).create({
                    userId,
                    userLogin,
                    addedAt: new Date(),
                    likedObjectId: ownerId,
                    likedObjectType: ownerType,
                    status: likeStatus.None
                });
            } else {
                // Обновление статуса пользователя
                userStatus.status = likeStatus.None;
            }

            await this.dataSource.getRepository(UsersLikesConnectionEntity).save(userStatus);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async createLikesInfo(
        ownerId: string,
        ownerType: LikeObjectTypeEnum,
    ): Promise<boolean> {
        try {
            // Создание нового экземпляра LikeInfoEntity
            const newLike = new LikeInfoEntity();
            newLike.ownerType = ownerType;
            newLike.ownerId = ownerId;
            newLike.likesCount = 0;
            newLike.dislikesCount = 0;

            // Сохранение экземпляра в базе данных
            await this.dataSource.getRepository(LikeInfoEntity).save(newLike);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async findLastThreeLikesPost(postId: string) {
        // Использование Query Builder для выполнения запроса
        const likesData = await this.dataSource.getRepository(UsersLikesConnectionEntity)
            .createQueryBuilder("ul")
            .select(["ul.id",
                "ul.userId",
                "ul.userLogin",
                "ul.addedAt",
                "ul.likedObjectId",
                "ul.likedObjectType",
                "ul.status"])
            .where("ul.likedObjectId = :postId", {postId})
            .andWhere("ul.likedObjectType = :type", {type: 'Post'})
            .andWhere("ul.status = :status", {status: likeStatus.Like})
            .orderBy("ul.addedAt", "DESC")
            .limit(3)
            .getMany();

        return likesData;
    }
}
