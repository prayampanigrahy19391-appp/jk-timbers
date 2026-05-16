export interface PaginationArgs {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Helper to calculate skip and take for Prisma queries
 */
export function getPaginationOptions({ page = 1, limit = 10 }: PaginationArgs) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit)); // Max 100 items per page

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Helper to construct the paginated response
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  { page = 1, limit = 10 }: PaginationArgs
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const totalPages = Math.ceil(total / safeLimit);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}
