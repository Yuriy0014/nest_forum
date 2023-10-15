import mongoose from 'mongoose';
import { likesInfoViewModel } from '../../likes/models/likes.models';

export type CreateCommentModel = {
  content: string;
};

export type UpdateCommentModel = {
  content: string;
};

export class CommentDbModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public postId: string,
    public content: string,
    public commentatorInfo: CommentatorInfoType,
    public createdAt: string,
  ) {}
}

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  createdAt: string;
  likesInfo: likesInfoViewModel;
};

export type CommentsFilterModel = {
  postId: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};

export type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type CommentsWithPaginationModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewModel[];
};
