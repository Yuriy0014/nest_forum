import {Injectable} from '@nestjs/common';
import {likesInfoViewModel, likeStatusModel} from '../models/likes.models-sql';
import {LikeInfoEntity, UsersLikesConnectionEntity} from "../entities/likes.entities";

@Injectable()
export class MapLikeViewModelSQL {
    getLikesInfoViewModel = (
        likes: LikeInfoEntity,
        userStatus: UsersLikesConnectionEntity | { status: likeStatusModel },
    ): likesInfoViewModel => {
        return {
            likesCount: likes.likesCount,
            dislikesCount: likes.dislikesCount,
            myStatus: userStatus.status,
        };
    };
}
