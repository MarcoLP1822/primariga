import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseUserInteractionRepository } from '../../data/repositories/SupabaseUserInteractionRepository';
import { SupabaseBookRepository } from '../../data/repositories/SupabaseBookRepository';
import { useAppStore } from '../../infrastructure/store/store';
import { InteractionType } from '../../domain/entities/UserInteraction';

const userInteractionRepository = new SupabaseUserInteractionRepository();
const bookRepository = new SupabaseBookRepository();

/**
 * Hook per ottenere i libri piaciuti dall'utente
 * 
 * IMPORTANT: gcTime impostato a 0 per evitare che likes di utenti precedenti
 * persistano in cache dopo logout/riavvio app
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
    // Don't persist this query - always fetch fresh when user logs in
    gcTime: 0,
  });
}

/**
 * Hook per verificare se un libro è piaciuto
 * 
 * IMPORTANT: gcTime impostato a 0 per evitare problemi di cache cross-user
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
    // Don't persist this query
    gcTime: 0,
  });
}

/**
 * Hook per aggiungere/rimuovere like ad un libro
 * 
 * IMPORTANTE: Per utenti anonimi, la mutazione NON viene eseguita.
 * Il component chiamante deve controllare `requiresAuth()` prima di chiamare `mutate`
 * e mostrare l'AuthPrompt se necessario.
 * 
 * @example
 * ```tsx
 * const toggleLike = useToggleLike();
 * const requiresAuth = useAppStore((state) => state.requiresAuth);
 * const [showAuthPrompt, setShowAuthPrompt] = useState(false);
 * 
 * const handleToggle = () => {
 *   if (requiresAuth()) {
 *     setShowAuthPrompt(true);
 *     return;
 *   }
 *   toggleLike.mutate({ bookId, isLiked });
 * };
 * ```
 */
export function useToggleLike() {
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.userId);

  return useMutation({
    mutationFn: async ({ bookId, isLiked }: { bookId: string; isLiked: boolean }) => {
      if (!userId) {
        throw new Error('User not authenticated. This should not happen - check requiresAuth() before calling mutate.');
      }

      if (isLiked) {
        // Se già piaciuto, rimuovi l'interazione
        return await userInteractionRepository.removeInteraction(userId, bookId);
      } else {
        // Altrimenti aggiungi il like
        return await userInteractionRepository.saveInteraction(
          userId,
          bookId,
          InteractionType.LIKE
        );
      }
    },
    onSuccess: (_, { bookId }) => {
      // Invalida cache per aggiornare UI
      queryClient.invalidateQueries({ queryKey: ['likedBooks', userId] });
      queryClient.invalidateQueries({ queryKey: ['isBookLiked', bookId, userId] });
    },
  });
}
