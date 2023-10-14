import mongoose, { HydratedDocument } from 'mongoose';
import { BlogModelClass } from './domain/blogs.domain-entities';

export class BlogDbModel {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}

  static createBlog(
    name: string,
    description: string,
    websiteUrl: string,
  ): HydratedDocument<BlogDbModel> {
    const blogInstance = new BlogModelClass();
    blogInstance.name = name;
    blogInstance.description = description;
    blogInstance.websiteUrl = websiteUrl;
    blogInstance._id = new mongoose.Types.ObjectId();
    blogInstance.createdAt = new Date().toISOString();
    blogInstance.isMembership = false;

    return blogInstance;
  }
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
