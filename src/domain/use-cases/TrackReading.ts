import { ReadingHistory } from '../entities/ReadingHistory';
import { IReadingHistoryRepository } from '../repositories/IReadingHistoryRepository';

export class TrackReading {
  constructor(private readingHistoryRepository: IReadingHistoryRepository) {}

  async execute(
    userId: string,
    bookLineId: string
  ): Promise<ReadingHistory> {
    // Traccia che l'utente ha visto questa prima riga
    const history = await this.readingHistoryRepository.trackReading(
      userId,
      bookLineId
    );
    return history;
  }
}
