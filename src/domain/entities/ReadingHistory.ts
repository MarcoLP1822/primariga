/**
 * ReadingHistory Entity
 * Rappresenta una lettura storica
 */
export interface ReadingHistory {
  id: string;
  userId: string;
  bookId: string;
  readAt: Date;
  readingDurationSeconds?: number;
}

/**
 * Factory per creare un ReadingHistory da dati raw
 */
export function createReadingHistory(data: {
  id: string;
  user_id: string;
  book_id: string;
  read_at: string;
  reading_duration_seconds?: number | null;
}): ReadingHistory {
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    readAt: new Date(data.read_at),
    readingDurationSeconds: data.reading_duration_seconds ?? undefined,
  };
}
