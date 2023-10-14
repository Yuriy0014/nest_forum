import {
  BlogDbModel,
  BlogViewModel,
} from '../features/blogs/models/blogs.models';

export const getBlogViewModel = (blog: BlogDbModel): BlogViewModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
