/**
 * Interaction Types
 */
export enum InteractionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  SKIP = 'skip',
  PURCHASE = 'purchase',
}

/**
 * UserInteraction Entity
 * Rappresenta l'interazione di un utente con un libro
 */
export interface UserInteraction {
  id: string;
  userId: string;
  bookId: string;
  interactionType: InteractionType;
  liked?: boolean; // Flag per indicare se il libro è piaciuto
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Factory per creare un UserInteraction da dati raw
 */
export function createUserInteraction(data: {
  id: string;
  user_id: string;
  book_id: string;
  interaction_type: string;
  created_at: string;
}): UserInteraction {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    interactionType: data.interaction_type as InteractionType,
    createdAt: new Date(data.created_at),
  };
}
