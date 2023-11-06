import { Injectable } from '@nestjs/common';
import {
  likesInfoViewModel,
  likeStatusModel,
} from '../likes/models/likes.models';
import { LikeService } from '../likes/likes.service';
import { LikeObjectTypeEnum } from '../likes/models/domain/likes.domain-entities';

@Injectable()
export class PostsService {
  constructor(private readonly likesService: LikeService) {}

  async likePost(
    postId: string,
    likesInfo: likesInfoViewModel,
    newLikeStatus: likeStatusModel,
    userId: string,
    userLogin: string,
  ): Promise<boolean> {
    return await this.likesService.likeEntity(
      LikeObjectTypeEnum.Post,
      postId,
      likesInfo,
      newLikeStatus,
      userId,
      userLogin,
    );
  }
}
