import { extendedLikesInfoViewModel } from '../../likes/models/likes.models';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ExistingBlog } from '../guards/CustomDoesBlogExist';

export class PostDbModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
  ) {}
}

export class PostCreateModelBase {
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'title should not consist of whitespace characters',
  })
  title: string;

  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'shortDescription should not consist of whitespace characters',
  })
  shortDescription: string;

  @IsString()
  @Length(2, 1000)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'content should not consist of whitespace characters',
  })
  content: string;
}

export class PostCreateModelFromBlog extends PostCreateModelBase {
  blogId: string;
}

export class PostCreateModelStandart extends PostCreateModelBase {
  @ExistingBlog()
  blogId: string;
}

export class PostUpdateModel {
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'title should not consist of whitespace characters',
  })
  title: string;

  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'shortDescription should not consist of whitespace characters',
  })
  shortDescription: string;

  @IsString()
  @Length(2, 1000)
  @IsNotEmpty()
  @Matches(/.*\S+.*/, {
    message: 'content should not consist of whitespace characters',
  })
  content: string;

  @ExistingBlog()
  blogId: string;
}

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
