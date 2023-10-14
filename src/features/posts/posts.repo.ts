import { Injectable } from '@nestjs/common';
import { HydratedDocument } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Post,
  postDBMethodsType,
  postDocument,
  postModelType,
} from './models/domain/posts.domain-entities';
import { PostDBModel } from './models/posts.models';

@Injectable()
export class PostsRepo {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: postModelType,
  ) {}

  async save(Post: postDocument): Promise<void> {
    await Post.save();
  }

  async findPostById(userId: string) {
    const foundPost: HydratedDocument<PostDBModel, postDBMethodsType> | null =
      await this.postModel.findById(userId);
    if (foundPost) {
      return foundPost;
    } else {
      return null;
    }
  }

  async deletePost(foundPost: postDocument) {
    await foundPost.deleteOne();
    return true;
  }
}
