import { UserInteraction, InteractionType } from '../entities';

/**
 * Repository interface per UserInteractions
 */
export interface IUserInteractionRepository {
  /**
   * Salva o aggiorna un'interazione utente
   */
  saveInteraction(
    userId: string,
    bookId: string,
    interactionType: InteractionType
  ): Promise<UserInteraction>;

  /**
   * Ottiene l'interazione di un utente con un libro
   */
  getUserInteraction(userId: string, bookId: string): Promise<UserInteraction | null>;

  /**
   * Ottiene tutte le interazioni di un utente
   */
  getUserInteractions(
    userId: string,
    interactionType?: InteractionType
  ): Promise<UserInteraction[]>;

  /**
   * Ottiene i libri piaciuti dall'utente
   */
  getLikedBooks(userId: string): Promise<string[]>;

  /**
   * Ottiene i libri acquistati dall'utente
   */
  getPurchasedBooks(userId: string): Promise<string[]>;

  /**
   * Rimuove un'interazione
   */
  removeInteraction(userId: string, bookId: string): Promise<void>;
}
