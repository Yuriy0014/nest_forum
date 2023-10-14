import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostFilterModel } from './helpers/filter';
import { FilterQuery } from 'mongoose';
import { Post, postModelType } from './models/domain/posts.domain-entities';
import { PostDBModel } from './models/posts.models';
import { MapPostViewModel } from './helpers/map-PostViewModel';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
    private readonly mapPostViewModel: MapPostViewModel,
  ) {}

  async findPostById(id: string) {
    const foundPost: PostDBModel | null = await this.postModel
      .findById(id)
      .lean();
    if (foundPost) {
      return this.mapPostViewModel.getPostViewModel(foundPost);
    } else {
      return null;
    }
  }

  async FindAllPost(queryFilter: PostFilterModel) {
    const findFilter: FilterQuery<PostDBModel> =
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
    const foundPostsFunction = (postArr: PostDBModel[]) => {
      const promises = postArr.map(
        async (value) => await this.mapPostViewModel.getPostViewModel(value),
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
