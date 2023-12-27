import {
    likeDBModel,
    likesInfoViewModel,
    likeStatus,
    ownerTypeModel,
    usersLikesConnectionDBModel,
} from './models/likes.models-sql';
import {Injectable} from '@nestjs/common';
import {MapLikeViewModelSQL} from './helpers/map-likesViewModel-sql';
import {InjectDataSource} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';

@Injectable()
export class LikesQueryRepoSQL {
    constructor(
        private readonly mapLikeViewModel: MapLikeViewModelSQL,
        @InjectDataSource() protected dataSource: DataSource,
    ) {
    }

    //  Получаем информацию о лайках для поста\коммента
    async findLikesByOwnerId(
        ownerType: ownerTypeModel,
        ownerId: string,
        userId: string | undefined = undefined,
    ): Promise<likesInfoViewModel | null> {
        const foundLikes: likeDBModel[] = await this.dataSource.query(
            `
                SELECT l."id", l."ownerType", l."ownerId", l."likesCount", l."dislikesCount"
                FROM public.likes l
                WHERE (l."ownerId" = $1);`,
            [ownerId],
        );

        if (!foundLikes[0]) return null;
        //  Получаем информацию о статусе лайка для текущего польхователя
        // Пустой ID это тот случай, когда user не авторизован
        let foundStatus:
            | usersLikesConnectionDBModel[]
            | { status: likeStatus.None };
        if (userId === undefined) {
            foundStatus = {
                status: likeStatus.None,
            };

            return this.mapLikeViewModel.getLikesInfoViewModel(
                foundLikes[0],
                foundStatus,
            );
        }

        foundStatus = await this.dataSource.query(
            `
                SELECT c."status"
                FROM public."userslikesconnection" c
                WHERE (c."userId" = $1 AND c."likedObjectId" = $2 AND c."likedObjectType" = $3);`,
            [userId, ownerId, ownerType],
        );

        if (!foundStatus[0]) {
            foundStatus = {
                status: likeStatus.None,
            };

            return this.mapLikeViewModel.getLikesInfoViewModel(
                foundLikes[0],
                foundStatus,
            );
        }

        return this.mapLikeViewModel.getLikesInfoViewModel(
            foundLikes[0],
            foundStatus[0],
        );
    }
}
