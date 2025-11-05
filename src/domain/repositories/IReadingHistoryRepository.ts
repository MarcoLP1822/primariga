import { ReadingHistory } from '../entities';

/**
 * Repository interface per ReadingHistory
 */
export interface IReadingHistoryRepository {
  /**
   * Salva una lettura nello storico
   */
  saveReading(userId: string, bookId: string, durationSeconds?: number): Promise<ReadingHistory>;

  /**
   * Traccia che l'utente ha visto una book line
   */
  trackReading(userId: string, bookLineId: string): Promise<ReadingHistory>;

  /**
   * Ottiene lo storico letture di un utente (alias)
   */
  getByUserId(userId: string, limit?: number): Promise<ReadingHistory[]>;

  /**
   * Ottiene lo storico letture di un utente
   */
  getUserReadingHistory(userId: string, limit?: number): Promise<ReadingHistory[]>;

  /**
   * Ottiene le statistiche di lettura di un utente
   */
  getReadingStats(userId: string): Promise<{
    totalBooksRead: number;
    totalReadingTimeSeconds: number;
    averageReadingTimeSeconds: number;
    recentlyRead: ReadingHistory[];
  }>;

  /**
   * Verifica se un libro è stato già letto
   */
  hasReadBook(userId: string, bookId: string): Promise<boolean>;
}
