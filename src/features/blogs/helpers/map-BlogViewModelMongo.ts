import { Injectable } from '@nestjs/common';
import { BlogDbModel, BlogViewModel } from '../models/blogs.models-mongo';

@Injectable()
export class MapBlogViewModelMongo {
    getBlogViewModel = (blog: BlogDbModel): BlogViewModel => {
        return { 
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        };
    };
}
