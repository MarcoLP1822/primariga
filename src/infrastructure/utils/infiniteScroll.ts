/**
 * Infinite Scroll Utilities
 * 
 * Hooks e utilities per implementare infinite scroll con React Query
 */

import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { queryKeys } from '../config/queryClient';
import { supabase } from '../../data/supabaseClient';
import type { Book } from '../../domain/entities';

/**
 * Configurazione paginazione
 */
const PAGINATION_CONFIG = {
  pageSize: 20,
  maxPages: 10, // Limite per evitare uso eccessivo memoria
} as const;

/**
 * Response type per paginated data
 */
interface PaginatedResponse<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

/**
 * useInfiniteBooks - Hook per infinite scroll di books
 * 
 * Features:
 * - Lazy loading con pagination
 * - Automatic next page fetch quando scroll vicino al fondo
 * - Memory efficient (max 10 pages in memoria)
 * - Refetch on reconnect
 * 
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteBooks();
 * 
 * // In FlatList:
 * <FlatList
 *   data={data}
 *   onEndReached={() => hasNextPage && fetchNextPage()}
 *   onEndReachedThreshold={0.5}
 * />
 */
export function useInfiniteBooks() {
  const query = useInfiniteQuery<
    PaginatedResponse<Book>,
    Error,
    InfiniteData<PaginatedResponse<Book>>,
    readonly ['books', 'infinite'],
    number
  >({
    queryKey: [...queryKeys.books.all, 'infinite'] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGINATION_CONFIG.pageSize;
      const to = from + PAGINATION_CONFIG.pageSize - 1;

      const { data, error, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const nextCursor = to < (count ?? 0) - 1 ? pageParam + 1 : null;

      return {
        data: data as Book[],
        nextCursor,
        hasMore: nextCursor !== null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: PAGINATION_CONFIG.maxPages,
  });

  // Flatten paginated data in un singolo array
  const flatData = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  return {
    ...query,
    data: flatData,
  };
}

/**
 * useInfiniteReadingHistory - Hook per infinite scroll di reading history
 * 
 * Similar to useInfiniteBooks ma per reading history dell'utente
 */
export function useInfiniteReadingHistory(userId: string) {
  const query = useInfiniteQuery({
    queryKey: [...queryKeys.readingHistory.list(), userId, 'infinite'] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGINATION_CONFIG.pageSize;
      const to = from + PAGINATION_CONFIG.pageSize - 1;

      const { data, error, count } = await supabase
        .from('reading_history')
        .select(
          `
          *,
          books (
            id,
            title,
            author,
            cover_image_url
          )
        `,
          { count: 'exact' }
        )
        .eq('user_id', userId)
        .range(from, to)
        .order('read_at', { ascending: false });

      if (error) throw error;

      const nextCursor = to < (count ?? 0) - 1 ? pageParam + 1 : null;

      return {
        data: data ?? [],
        nextCursor,
        hasMore: nextCursor !== null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: PAGINATION_CONFIG.maxPages,
  });

  const flatData = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data]
  );

  return {
    ...query,
    data: flatData,
  };
}

/**
 * usePullToRefresh - Hook per pull-to-refresh gesture
 * 
 * @example
 * const { refreshing, onRefresh } = usePullToRefresh(refetch);
 * 
 * <FlatList
 *   refreshing={refreshing}
 *   onRefresh={onRefresh}
 * />
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return {
    refreshing,
    onRefresh,
  };
}
