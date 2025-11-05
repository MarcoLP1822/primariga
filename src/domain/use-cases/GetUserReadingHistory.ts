import { ReadingHistory } from '../entities/ReadingHistory';
import { IReadingHistoryRepository } from '../repositories/IReadingHistoryRepository';

export class GetUserReadingHistory {
  constructor(private readingHistoryRepository: IReadingHistoryRepository) {}

  async execute(userId: string): Promise<ReadingHistory[]> {
    // Ottiene la cronologia di lettura dell'utente
    const history = await this.readingHistoryRepository.getByUserId(userId);
    return history;
  }
}
