import { extendedLikesInfoViewModel } from '../../likes/models/likes.models';
import mongoose from 'mongoose';

export class PostDBModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}

export type PostCreateModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostUpdateModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: extendedLikesInfoViewModel;
};

export type URIParamsPostIdModel = {
  /*
   * id of existing post :)
   */
  id: string;
};

export type PostsWithPaginationModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewModel[];
};
