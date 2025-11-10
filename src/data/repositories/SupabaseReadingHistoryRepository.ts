import { IReadingHistoryRepository } from '../../domain/repositories/IReadingHistoryRepository';
import { ReadingHistory } from '../../domain/entities/ReadingHistory';
import { supabase } from '../supabaseClient';
import type { Database } from '../supabase/types.generated';

type ReadingHistoryRow = Database['public']['Tables']['user_reading_history']['Row'];
type ReadingHistoryInsert = Database['public']['Tables']['user_reading_history']['Insert'];

export class SupabaseReadingHistoryRepository implements IReadingHistoryRepository {
  async saveReading(
    userId: string,
    bookId: string,
    durationSeconds?: number
  ): Promise<ReadingHistory> {
    const insertData: ReadingHistoryInsert = {
      user_id: userId,
      book_id: bookId,
      duration_seconds: durationSeconds,
      read_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_reading_history')
      // Type assertion needed due to Supabase client type inference limitation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save reading history: ${error?.message}`);
    }

    const record = data as ReadingHistoryRow;
    return {
      id: record.id,
      userId: record.user_id,
      bookId: record.book_id,
      readAt: new Date(record.read_at),
      readingDurationSeconds: record.duration_seconds || undefined,
    };
  }

  async trackReading(userId: string, bookLineId: string): Promise<ReadingHistory> {
    // Per book_line_id, dobbiamo prima ottenere il book_id
    // Nota: Questa è una semplificazione. Dovremmo avere una tabella separata
    // o usare bookLineId direttamente se la tabella lo supporta
    const insertData: ReadingHistoryInsert = {
      user_id: userId,
      book_id: bookLineId, // Temporaneo: usiamo bookLineId come bookId
      read_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_reading_history')
      // Type assertion needed due to Supabase client type inference limitation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to track reading: ${error?.message}`);
    }

    const record = data as ReadingHistoryRow;
    return {
      id: record.id,
      userId: record.user_id,
      bookId: record.book_id,
      readAt: new Date(record.read_at),
      readingDurationSeconds: record.duration_seconds || undefined,
    };
  }

  async getByUserId(userId: string, limit?: number): Promise<ReadingHistory[]> {
    let query = supabase
      .from('user_reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('read_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    const records = data as ReadingHistoryRow[];
    return records.map((item) => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      readAt: new Date(item.read_at),
      readingDurationSeconds: item.duration_seconds || undefined,
    }));
  }

  async getUserReadingHistory(userId: string, limit?: number): Promise<ReadingHistory[]> {
    return this.getByUserId(userId, limit);
  }

  async getBookReadCount(bookId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_reading_history')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId);

    return error ? 0 : count || 0;
  }

  async getUserReadingStreak(userId: string): Promise<number> {
    // Calcola lo streak di lettura (giorni consecutivi con almeno una lettura)
    const { data, error } = await supabase
      .from('user_reading_history')
      .select('read_at')
      .eq('user_id', userId)
      .order('read_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return 0;
    }

    // Cast per risolvere problemi di type inference di Supabase
    const records = data as Array<{ read_at: string }>;

    // Converti le date in giorni (YYYY-MM-DD)
    const readDates = records.map((record) => {
      const date = new Date(record.read_at);
      return date.toISOString().split('T')[0];
    });

    // Rimuovi duplicati (stesso giorno)
    const uniqueDates = Array.from(new Set(readDates)).sort().reverse();

    // Calcola lo streak partendo da oggi
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    const currentDate = new Date(today);

    for (const readDate of uniqueDates) {
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (readDate === expectedDate) {
        streak++;
        // Vai al giorno precedente
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (readDate < expectedDate) {
        // C'è un gap nei giorni - lo streak si è interrotto
        break;
      }
    }

    return streak;
  }

  async getLastReadDate(userId: string): Promise<Date | null> {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select('read_at')
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    const record = data as Pick<ReadingHistoryRow, 'read_at'>;
    return new Date(record.read_at);
  }

  async getReadingStats(userId: string): Promise<{
    totalBooksRead: number;
    totalReadingTimeSeconds: number;
    averageReadingTimeSeconds: number;
    recentlyRead: ReadingHistory[];
  }> {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select('*')
      .eq('user_id', userId)
      .order('read_at', { ascending: false });

    if (error || !data) {
      return {
        totalBooksRead: 0,
        totalReadingTimeSeconds: 0,
        averageReadingTimeSeconds: 0,
        recentlyRead: [],
      };
    }

    const records = data as ReadingHistoryRow[];
    const totalTime = records.reduce((sum, item) => sum + (item.duration_seconds || 0), 0);
    const recentlyRead = records.slice(0, 10).map((item) => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      readAt: new Date(item.read_at),
      readingDurationSeconds: item.duration_seconds || undefined,
    }));

    return {
      totalBooksRead: records.length,
      totalReadingTimeSeconds: totalTime,
      averageReadingTimeSeconds: records.length > 0 ? totalTime / records.length : 0,
      recentlyRead,
    };
  }

  async hasReadBook(userId: string, bookId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_reading_history')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .limit(1)
      .single();

    return !error && !!data;
  }
}
