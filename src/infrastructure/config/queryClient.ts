import { QueryClient } from '@tanstack/react-query';

/**
 * Configurazione globale per React Query
 * Gestisce caching, retry logic e stale time per tutte le queries
 * 
 * Ottimizzazioni performance:
 * - Aggressive caching per ridurre network requests
 * - Smart retry strategy con exponential backoff
 * - Background refetch per dati sempre aggiornati
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache duration: 5 minuti (dati considerati freschi)
      staleTime: 1000 * 60 * 5,
      // Garbage collection: 30 minuti (mantieni in cache più a lungo)
      gcTime: 1000 * 60 * 30,
      // Retry failed requests 3 volte
      retry: 3,
      // Retry delay crescente: 1s, 2s, 4s, 8s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Non refetch automaticamente on window focus (migliore per mobile)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount solo se stale
      refetchOnMount: false,
      // Network mode: online first, fallback to cache
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations 1 volta
      retry: 1,
      // Network mode per mutations
      networkMode: 'online',
    },
  },
});

/**
 * Query keys centralizzati per consistency
 */
export const queryKeys = {
  books: {
    all: ['books'] as const,
    random: () => [...queryKeys.books.all, 'random'] as const,
    byId: (id: string) => [...queryKeys.books.all, id] as const,
    line: (id: string) => [...queryKeys.books.all, id, 'line'] as const,
  },
  userInteractions: {
    all: ['user-interactions'] as const,
    likes: () => [...queryKeys.userInteractions.all, 'likes'] as const,
    byBookId: (bookId: string) => [...queryKeys.userInteractions.all, bookId] as const,
  },
  readingHistory: {
    all: ['reading-history'] as const,
    list: () => [...queryKeys.readingHistory.all, 'list'] as const,
    stats: () => [...queryKeys.readingHistory.all, 'stats'] as const,
  },
  userProfile: {
    all: ['user-profile'] as const,
    current: () => [...queryKeys.userProfile.all, 'current'] as const,
  },
} as const;

