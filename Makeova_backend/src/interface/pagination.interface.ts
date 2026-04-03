export interface IPaginationQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  [key: string]: unknown;
}

export interface IPaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
