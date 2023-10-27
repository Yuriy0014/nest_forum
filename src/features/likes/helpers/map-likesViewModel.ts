import { Injectable } from '@nestjs/common';
import { likesInfoViewModel, likeStatusModel } from '../models/likes.models';
import {
  Like,
  UsersLikesConnection,
} from '../models/domain/likes.domain-entities';

@Injectable()
export class MapLikeViewModel {
  constructor() {}

  getLikesInfoViewModel = (
    likes: Like,
    userStatus: UsersLikesConnection | { status: likeStatusModel },
  ): likesInfoViewModel => {
    return {
      likesCount: likes.likesCount,
      dislikesCount: likes.dislikesCount,
      myStatus: userStatus.status,
    };
  };
}
