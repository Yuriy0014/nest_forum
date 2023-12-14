import { likesInfoViewModel } from '../../likes/models/likes.models-mongo';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CommentInputModel {
  @IsString()
  @Length(20, 200)
  @Matches(/.*\S+.*/, {
    message: 'content should not consist of whitespace characters',
  })
  content: string;
}

export type CommentCreateModel = {
  content: string;
  postId: string;
  userId: string;
  userLogin: string;
};

export class CommentUpdateModel {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}

export class CommentDbModel {
  constructor(
    public id: string,
    public postId: string,
    public content: string,
    public userId: string,
    public userLogin: string,
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
