import {Injectable} from '@nestjs/common';
import {PostViewModel} from '../models/posts.models-sql';
import {
    likeDetailsViewModel,
    likeStatus,
} from '../../likes/models/likes.models-sql';
import {LikesQueryRepoSQL} from '../../likes/likes.query-repo-sql';
import {LikesRepoSQL} from '../../likes/likes.repo-sql';
import {PostEntity} from "../entities/posts.entities";
import {UsersLikesConnectionEntity} from "../../likes/entities/likes.entities";

@Injectable()
export class MapPostViewModelSQL {
    constructor(
        protected likesQueryRepo: LikesQueryRepoSQL,
        protected likesRepo: LikesRepoSQL,
    ) {
    }

    async getPostViewModel(
        post: PostEntity,
        userId?: string | undefined,
    ): Promise<PostViewModel> {
        const postId = post.id;

        const likesInfo = (await this.likesQueryRepo.findLikesByOwnerId(
            'Post',
            postId,
            userId,
        )) ?? {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: likeStatus.None,
        };

        const likesLastThreeSQl: UsersLikesConnectionEntity[] =
            await this.likesRepo.findLastThreeLikesPost(postId);

        const likesLastThree = likesLastThreeSQl.map((value) => {
            const newItem: likeDetailsViewModel = {
                addedAt: value.addedAt.toISOString(),
                userId: value.userId,
                login: value.userLogin,
            };
            return newItem;
        });

        return {
            id: postId,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString(),
            extendedLikesInfo: {
                likesCount: likesInfo.likesCount,
                dislikesCount: likesInfo.dislikesCount,
                myStatus: likesInfo.myStatus,
                newestLikes: likesLastThree,
            },
        };
    }
}
