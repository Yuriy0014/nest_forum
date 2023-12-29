import {Injectable} from '@nestjs/common';
import {BlogViewModel} from '../models/blogs.models-sql';
import {BlogEntity} from "../entities/blogs.entities";

@Injectable()
export class MapBlogViewModelSQL {
    getBlogViewModel = (blog: BlogEntity): BlogViewModel => {
        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership,
        };
    };
}
