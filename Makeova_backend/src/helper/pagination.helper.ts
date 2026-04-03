import {
  IPaginationMeta,
  IPaginationQuery,
} from "../interface/pagination.interface.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

export interface IParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

class PaginationHelper {
  public parsePagination(query: IPaginationQuery = {}): IParsedPagination {
    const page = this.sanitizeNumber(query.page, DEFAULT_PAGE);
    const limit = Math.min(
      this.sanitizeNumber(query.limit, DEFAULT_LIMIT),
      MAX_LIMIT,
    );

    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  public buildMeta(
    totalItems: number,
    page: number,
    limit: number,
  ): IPaginationMeta {
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      perPage: limit,
      totalItems,
      totalPages,
      hasNextPage: totalPages > 0 && page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    };
  }

  private sanitizeNumber(
    value: number | string | undefined,
    fallback: number,
  ) {
    const parsedValue =
      typeof value === "string" ? Number(value.trim()) : value;

    if (!parsedValue || Number.isNaN(parsedValue) || parsedValue < 1) {
      return fallback;
    }

    return Math.floor(parsedValue);
  }
}

export default new PaginationHelper();
