export type PostFilterModel = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  blogId: string;
  pageSize: number;
};

export const queryPostPagination = (query: any): PostFilterModel => {
  return {
    searchNameTerm: query.searchNameTerm ?? '',
    sortBy: query.sortBy ?? 'createdAt',
    sortDirection: query.sortDirection === 'asc' ? 'asc' : 'desc',
    pageNumber: +(query.pageNumber ?? 1),
    blogId: query.blogId ?? '',
    pageSize: +(query.pageSize ?? 10),
  };
};
