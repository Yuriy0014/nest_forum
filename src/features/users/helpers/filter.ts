export type UserFilterModel = {
  searchNameTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
};

export const queryUserPagination = (query: any): UserFilterModel => {
  return {
    searchNameTerm: query.searchNameTerm ?? '',
    sortBy: query.sortBy ?? 'createdAt',
    sortDirection: query.sortDirection === 'asc' ? 'asc' : 'desc',
    pageNumber: +(query.pageNumber ?? 1),
    pageSize: +(query.pageSize ?? 10),
    searchLoginTerm: query.searchLoginTerm ?? '',
    searchEmailTerm: query.searchEmailTerm ?? '',
  };
};
