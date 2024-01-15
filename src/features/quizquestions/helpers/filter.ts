export class questionFilterModel {
    bodySearchTerm: string;
    publishedStatus: string;
    sortBy: string;
    sortDirection: 'ASC' | 'DESC';
    pageNumber: number;
    pageSize: number;
}

export const queryQuestionsPagination = (query: any): questionFilterModel => {
    return {
        bodySearchTerm: query.bodySearchTerm ?? null,
        publishedStatus: (query.publishedStatus === 'published' || query.publishedStatus === 'notPublished') ? query.publishedStatus : 'all',
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection === 'asc' ? 'ASC' : 'DESC',
        pageNumber: +(query.pageNumber ?? 1),
        pageSize: +(query.pageSize ?? 10),
    }
}