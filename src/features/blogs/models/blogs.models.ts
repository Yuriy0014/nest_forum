import mongoose from 'mongoose';
import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

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
  name: string;

  @IsString()
  @Length(2, 15)
  @IsNotEmpty()
  description: string;

  @IsUrl()
  websiteUrl: string;
}

export type BlogUpdateModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

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
