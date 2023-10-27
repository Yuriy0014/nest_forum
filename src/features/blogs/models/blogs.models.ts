import mongoose from 'mongoose';
import { IsNotEmpty, IsString, IsUrl, Length, Matches } from 'class-validator';

export class BlogDbModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export class BlogCreateModel {
  @IsString()
  @Length(2, 15)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'name should not consist of whitespace characters',
  })
  name: string;

  @IsString()
  @Length(2, 500)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'description should not consist of whitespace characters',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(5, 100)
  websiteUrl: string;
}

export class BlogUpdateModel {
  @IsString()
  @Length(2, 15)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'name should not consist of whitespace characters',
  })
  name: string;

  @IsString()
  @Length(2, 500)
  @IsNotEmpty()
  @Matches(/^\S+$/, {
    message: 'name should not consist of whitespace characters',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(5, 100)
  websiteUrl: string;
}

export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogsWithPaginationModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewModel[];
};

export type URIParamsBlogIdModel = {
  /*
   * id of existing post :)
   */
  id: string;
};
