import mongoose from 'mongoose';

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

export type BlogCreateModel = {
  name: string;
  description: string;
  websiteUrl: string;
};

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
