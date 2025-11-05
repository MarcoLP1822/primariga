import { QueryClient } from '@tanstack/react-query';

/**
 * Configurazione globale per React Query
 * Gestisce caching, retry logic e stale time per tutte le queries
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache duration: 5 minuti
      staleTime: 1000 * 60 * 5,
      // Garbage collection: 10 minuti
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 2 volte
      retry: 2,
      // Retry delay crescente: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Non refetch automaticamente on window focus (migliore per mobile)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations 1 volta
      retry: 1,
    },
  },
});
