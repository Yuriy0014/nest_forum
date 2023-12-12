import { Injectable } from '@nestjs/common';
import {
  likeDBModel,
  likesInfoViewModel,
  likeStatusModel,
  usersLikesConnectionDBModel,
} from '../models/likes.models-sql';

@Injectable()
export class MapLikeViewModelSQL {
  getLikesInfoViewModel = (
    likes: likeDBModel,
    userStatus: usersLikesConnectionDBModel | { status: likeStatusModel },
  ): likesInfoViewModel => {
    return {
      likesCount: likes.likesCount,
      dislikesCount: likes.dislikesCount,
      myStatus: userStatus.status,
    };
  };
}
