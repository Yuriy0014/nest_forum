import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostFilterModel } from './helpers/filter';
import { FilterQuery } from 'mongoose';
import { Post, postModelType } from './models/domain/posts.domain-entities';
import { PostDbModel } from './models/posts.models-mongo';
import { MapPostViewModelMongo } from './helpers/map-PostViewModel-mongo';

@Injectable()
export class PostsQueryRepoMongo {
    constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    private readonly mapPostViewModel: MapPostViewModelMongo,
    ) {}

    async findPostById(id: string, userId?: string) {
        const foundPost: PostDbModel | null = await this.postModel
            .findById(id)
            .lean();
        if (foundPost) {
            return this.mapPostViewModel.getPostViewModel(foundPost, userId);
        } else {
            return null;
        }
    }

    async FindAllPost(queryFilter: PostFilterModel, userId?: string) {
        const findFilter: FilterQuery<PostDbModel> =
      queryFilter.blogId === '' ? {} : { blogId: queryFilter.blogId };
        const sortFilter: any =
      queryFilter.sortBy === 'createdAt'
          ? { [queryFilter.sortBy]: queryFilter.sortDirection }
          : { [queryFilter.sortBy]: queryFilter.sortDirection, createdAt: 1 };

        const foundPostsMongoose = await this.postModel
            .find(findFilter)
            .lean()
            .sort(sortFilter)
            .skip((queryFilter.pageNumber - 1) * queryFilter.pageSize)
            .limit(queryFilter.pageSize);

        /// Код нужен чтобы не ругалось в return в Items т.к. там возвращаются Promises
        const foundPostsFunction = (postArr: PostDbModel[]) => {
            const promises = postArr.map(
                async (value) =>
                    await this.mapPostViewModel.getPostViewModel(value, userId),
            );
            return Promise.all(promises);
        };

        const foundPosts = await foundPostsFunction(foundPostsMongoose);

        const totalCount = await this.postModel.countDocuments(findFilter);

        return {
            pagesCount: Math.ceil(totalCount / queryFilter.pageSize),
            page: queryFilter.pageNumber,
            pageSize: queryFilter.pageSize,
            totalCount: totalCount,
            items: foundPosts,
        };
    }
}
