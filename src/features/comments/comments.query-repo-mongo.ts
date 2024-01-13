import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Comment,
    CommentModelType,
} from './models/domain/comments.domain-entities';
import { MapCommentViewModelMongo } from './helpers/map-CommentViewModel-mongo';
import {
    CommentDbModel,
    CommentsFilterModel,
} from './models/comments.models-mongo';
import { FilterQuery } from 'mongoose';

@Injectable()
export class CommentsQueryRepoMongo {
    constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    private readonly mapCommentViewModel: MapCommentViewModelMongo,
    ) {}

    async findCommentById(id: string, userId?: string) {
        const foundComment = await this.commentModel.findById(id);
        if (foundComment) {
            return this.mapCommentViewModel.getCommentViewModel(foundComment, userId);
        } else {
            return null;
        }
    }

    async findComments(queryFilter: CommentsFilterModel, userId?: string) {
        const findFilter: FilterQuery<CommentDbModel> = {
            postId: queryFilter.postId,
        };
        const sortFilter: any =
      queryFilter.sortBy === 'createdAt'
          ? { [queryFilter.sortBy]: queryFilter.sortDirection }
          : {
              [queryFilter.sortBy]: queryFilter.sortDirection,
              createdAt: 1,
          };

        const foundCommentsMongoose = await this.commentModel
            .find(findFilter)
            .lean()
            .sort(sortFilter)
            .skip((queryFilter.pageNumber - 1) * queryFilter.pageSize)
            .limit(queryFilter.pageSize);

        /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
        const foundCommentsFunction = (commArr: CommentDbModel[]) => {
            const promises = commArr.map(
                async (value) =>
                    await this.mapCommentViewModel.getCommentViewModel(value, userId),
            );
            return Promise.all(promises);
        };

        const foundComments = await foundCommentsFunction(foundCommentsMongoose);

        const totalCount = await this.commentModel.countDocuments(findFilter);

        return {
            pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: totalCount,
            items: foundComments,
        };
    }
}
