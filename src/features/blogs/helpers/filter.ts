export type BlogFilterModel = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
};

export const queryBlogPagination = (query: any): BlogFilterModel => {
  return {
    searchNameTerm: query.searchNameTerm ?? '',
    sortBy: query.sortBy ?? 'createdAt',
    sortDirection: query.sortDirection === 'asc' ? 'asc' : 'desc',
    pageNumber: +(query.pageNumber ?? 1),
    pageSize: +(query.pageSize ?? 10),
  };
};
