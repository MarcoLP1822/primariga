import { UserProfile } from '../entities';

/**
 * Repository interface per UserProfile
 * Define i contratti che l'implementazione deve rispettare
 */
export interface IUserProfileRepository {
  /**
   * Ottiene il profilo dell'utente corrente
   */
  getCurrentProfile(): Promise<UserProfile | null>;

  /**
   * Ottiene un profilo per ID
   */
  getById(userId: string): Promise<UserProfile | null>;

  /**
   * Alias per compatibilità
   */
  getProfileById(userId: string): Promise<UserProfile | null>;

  /**
   * Crea un nuovo profilo utente
   */
  create(profile: Omit<UserProfile, 'updatedAt'>): Promise<UserProfile>;

  /**
   * Aggiorna il profilo dell'utente corrente
   */
  updateProfile(
    data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProfile>;

  /**
   * Cerca profili per username
   */
  searchByUsername(username: string): Promise<UserProfile[]>;
}
