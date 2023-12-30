import {CommentsFilterModel} from '../models/comments.models-mongo';

export const queryCommentsWithPagination = (
    query: any,
    postId: string,
): CommentsFilterModel => {
    return {
        postId: postId,
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection === 'asc' ? 'ASC' : 'DESC',
        pageNumber: +(query.pageNumber ?? 1),
        pageSize: +(query.pageSize ?? 10),
    };
};
