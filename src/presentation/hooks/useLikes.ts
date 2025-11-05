import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseUserInteractionRepository } from '../../data/repositories/SupabaseUserInteractionRepository';
import { SupabaseBookRepository } from '../../data/repositories/SupabaseBookRepository';
import { useAppStore } from '../../infrastructure/store/store';

const userInteractionRepository = new SupabaseUserInteractionRepository();
const bookRepository = new SupabaseBookRepository();

/**
 * Hook per ottenere i libri piaciuti dall'utente
 */
export function useLikedBooks() {
  const userId = useAppStore((state) => state.userId);

  return useQuery({
    queryKey: ['likedBooks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const bookIds = await userInteractionRepository.getLikedBooks(userId);
      if (bookIds.length === 0) return [];
      return await bookRepository.getBooksByIds(bookIds);
    },
    enabled: !!userId,
  });
}

/**
 * Hook per verificare se un libro è piaciuto
 */
export function useIsBookLiked(bookId: string | undefined) {
  const userId = useAppStore((state) => state.userId);

  return useQuery({
    queryKey: ['isBookLiked', bookId, userId],
    queryFn: async () => {
      if (!userId || !bookId) return false;
      const interaction = await userInteractionRepository.getUserInteraction(userId, bookId);
      return interaction?.interactionType === 'like';
    },
    enabled: !!userId && !!bookId,
  });
}

/**
 * Hook per aggiungere/rimuovere like ad un libro
 */
export function useToggleLike() {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);

  return useMutation({
    mutationFn: async ({ bookId, isLiked }: { bookId: string; isLiked: boolean }) => {
      if (!userId) throw new Error('User not authenticated');

      const interactionType = !isLiked ? 'like' : 'dislike';
      return await userInteractionRepository.saveInteraction(
        userId,
        bookId,
        interactionType as any
      );
    },
    onSuccess: (_, { bookId }) => {
      // Invalida cache per aggiornare UI
      queryClient.invalidateQueries({ queryKey: ['likedBooks', userId] });
      queryClient.invalidateQueries({ queryKey: ['isBookLiked', bookId, userId] });
    },
  });
}
