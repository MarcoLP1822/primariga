import { IReadingHistoryRepository } from '../../domain/repositories/IReadingHistoryRepository';
import { ReadingHistory } from '../../domain/entities/ReadingHistory';
import { supabase } from '../supabaseClient';

export class SupabaseReadingHistoryRepository implements IReadingHistoryRepository {
  async saveReading(
    userId: string,
    bookId: string,
    durationSeconds?: number
  ): Promise<ReadingHistory> {
    const { data, error } = await supabase
      .from('user_reading_history')
      .insert({
        user_id: userId,
        book_id: bookId,
        duration_seconds: durationSeconds,
        read_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to save reading history: ${error?.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      readAt: new Date(data.read_at),
      readingDurationSeconds: data.duration_seconds || undefined,
    };
  }
  
  async trackReading(userId: string, bookLineId: string): Promise<ReadingHistory> {
    // Per book_line_id, dobbiamo prima ottenere il book_id
    // Nota: Questa è una semplificazione. Dovremmo avere una tabella separata
    // o usare bookLineId direttamente se la tabella lo supporta
    const { data, error } = await supabase
      .from('user_reading_history')
      .insert({
        user_id: userId,
        book_id: bookLineId, // Temporaneo: usiamo bookLineId come bookId
        read_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to track reading: ${error?.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      readAt: new Date(data.read_at),
      readingDurationSeconds: data.duration_seconds || undefined,
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
    
    return data.map(item => ({
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
    
    return error ? 0 : (count || 0);
  }

  async getUserReadingStreak(userId: string): Promise<number> {
    // TODO: Implementare logica per calcolare lo streak
    // Per ora ritorna 0
    return 0;
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
    
    return new Date(data.read_at);
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
    
    const totalTime = data.reduce((sum, item) => sum + (item.duration_seconds || 0), 0);
    const recentlyRead = data.slice(0, 10).map(item => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      readAt: new Date(item.read_at),
      readingDurationSeconds: item.duration_seconds || undefined,
    }));
    
    return {
      totalBooksRead: data.length,
      totalReadingTimeSeconds: totalTime,
      averageReadingTimeSeconds: data.length > 0 ? totalTime / data.length : 0,
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
