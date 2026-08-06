import { NextRequest } from 'next/server';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginates an in-memory array of items.
 * Supports backward compatibility (returns the plain array if page/limit params are omitted).
 */
export function paginateArray<T>(
  req: NextRequest,
  items: T[],
  searchFields: (item: T) => (string | null | undefined)[]
): PaginatedResult<T> | T[] {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const searchParam = searchParams.get('search')?.trim().toLowerCase() || '';

  // If no pagination params are provided, return the full array for backward compatibility
  if (!pageParam && !limitParam) {
    return items;
  }

  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const limit = limitParam ? Math.max(1, parseInt(limitParam)) : 25;

  let filteredItems = items;
  if (searchParam) {
    filteredItems = items.filter((item) => {
      const fields = searchFields(item);
      return fields.some((field) => field?.toLowerCase().includes(searchParam));
    });
  }

  const total = filteredItems.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedItems = filteredItems.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    total,
    page,
    limit,
    totalPages,
  };
}
