import {
    likesInfoViewModel,
    likeStatus,
    ownerTypeModel
} from './models/likes.models-sql';
import {Injectable} from '@nestjs/common';
import {MapLikeViewModelSQL} from './helpers/map-likesViewModel-sql';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {LikeInfoEntity, UsersLikesConnectionEntity} from "./entities/likes.entities";

@Injectable()
export class LikesQueryRepoSQL {
    constructor(
        @InjectRepository(LikeInfoEntity)
        private likeInfoRepository: Repository<LikeInfoEntity>,
        @InjectRepository(UsersLikesConnectionEntity)
        private usersLikesConnectionRepository: Repository<UsersLikesConnectionEntity>,
        private mapLikeViewModel: MapLikeViewModelSQL,
    ) {
    }

    //  Получаем информацию о лайках для поста\коммента
    async findLikesByOwnerId(
        ownerType: ownerTypeModel,
        ownerId: string,
        userId: string | undefined = undefined,
    ): Promise<likesInfoViewModel | null> {
        // Получение информации о лайках
        const foundLikes = await this.likeInfoRepository.find({
            where: {ownerId: ownerId},
            select: ["id", "ownerType", "ownerId", "likesCount", "dislikesCount"]
        });

        if (!foundLikes[0]) return null;

        // Получаем информацию о статусе лайка для текущего пользователя
        // Пустой ID это тот случай, когда user не авторизован
        let foundStatus: UsersLikesConnectionEntity[] | { status: likeStatus.None };

        if (userId === undefined) {
            foundStatus = {status: likeStatus.None};
            return this.mapLikeViewModel.getLikesInfoViewModel(foundLikes[0], foundStatus);
        }

        foundStatus = await this.usersLikesConnectionRepository.find({
            where: {
                userId: userId,
                likedObjectId: ownerId,
                likedObjectType: ownerType
            },
            select: ["status"]
        });

        if (!foundStatus[0]) {
            foundStatus = {status: likeStatus.None};
            return this.mapLikeViewModel.getLikesInfoViewModel(foundLikes[0], foundStatus);
        }

        return this.mapLikeViewModel.getLikesInfoViewModel(foundLikes[0], foundStatus[0]);

    }
}
