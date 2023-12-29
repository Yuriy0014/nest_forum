import {Injectable} from '@nestjs/common';
import {
    CommentViewModel,
} from '../models/comments.models-sql';
import {likeStatus} from '../../likes/models/likes.models-sql';
import {LikesQueryRepoSQL} from '../../likes/likes.query-repo-sql';
import {CommentEntity} from "../entities/coments.entities";

@Injectable()
export class MapCommentViewModelSQL {
    constructor(private readonly likesQueryRepo: LikesQueryRepoSQL) {
    }

    async getCommentViewModel(
        comment: CommentEntity,
        userId?: string | undefined,
    ): Promise<CommentViewModel> {
        const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
            'Comment',
            comment.id,
            userId,
        )) ?? {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        };

        console.log('Коммент Считан');
        console.log(new Date().toISOString());
        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: comment.userLogin,
            },
            createdAt: comment.createdAt.toISOString(),
            likesInfo: likesInfo,
        };
    }
}
