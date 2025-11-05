import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseBookRepository } from '../../data/repositories/SupabaseBookRepository';
import { useAppStore } from '../../infrastructure/store/store';

const bookRepository = new SupabaseBookRepository();

/**
 * Hook per ottenere un libro casuale
 * I libri possono essere rivisti più volte
 */
export function useRandomBook() {
  const addSeenBook = useAppStore((state) => state.addSeenBook);

  return useQuery({
    queryKey: ['randomBook'],
    queryFn: async () => {
      // Non escludiamo più i libri già visti - possono essere rivisti
      const book = await bookRepository.getRandomBook([]);
      if (book) {
        addSeenBook(book.id);
      }
      return book;
    },
    // Refetch ogni volta che viene chiamato
    staleTime: 0,
  });
}

/**
 * Hook per ottenere un libro specifico per ID
 */
export function useBook(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      return await bookRepository.getBookById(bookId);
    },
    enabled: !!bookId,
  });
}

/**
 * Hook per ottenere lista paginata di libri
 */
export function useBooks(page: number = 0, limit: number = 20) {
  const selectedGenres = useAppStore((state) => state.selectedGenres);
  const selectedLanguage = useAppStore((state) => state.selectedLanguage);

  return useQuery({
    queryKey: ['books', page, selectedGenres, selectedLanguage],
    queryFn: async () => {
      return await bookRepository.getBooks({
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        language: selectedLanguage !== 'it' ? selectedLanguage : undefined,
        limit,
        offset: page * limit,
      });
    },
  });
}

/**
 * Hook per ottenere la prima riga di un libro
 */
export function useBookLine(bookId: string | undefined) {
  return useQuery({
    queryKey: ['bookLine', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      return await bookRepository.getBookLine(bookId);
    },
    enabled: !!bookId,
  });
}

/**
 * Hook per cercare libri
 */
export function useSearchBooks(searchQuery: string) {
  return useQuery({
    queryKey: ['searchBooks', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      return await bookRepository.searchBooks(searchQuery);
    },
    enabled: searchQuery.length >= 2,
  });
}

/**
 * Hook per incrementare il view count di un libro
 */
export function useIncrementBookView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      return await bookRepository.incrementViewCount(bookId);
    },
    onSuccess: (_, bookId) => {
      // Invalida la cache del libro per refetchare dati aggiornati
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });
}

/**
 * Hook per incrementare il click count di un libro
 */
export function useIncrementBookClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      return await bookRepository.incrementClickCount(bookId);
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });
}
