export type BlogFilterMongoModel = {
    searchNameTerm: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    pageNumber: number;
    pageSize: number;
};

export type BlogFilterModel = {
    searchNameTerm: string;
    sortBy: string;
    sortDirection: 'ASC' | 'DESC';
    pageNumber: number;
    pageSize: number;
};

export const queryBlogPagination = (query: any): BlogFilterModel => {
    return {
        searchNameTerm: query.searchNameTerm ?? null,
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection === 'asc' ? 'ASC' : 'DESC',
        pageNumber: +(query.pageNumber ?? 1),
        pageSize: +(query.pageSize ?? 10),
    };
};
