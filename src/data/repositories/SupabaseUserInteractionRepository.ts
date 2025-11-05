import { IUserInteractionRepository } from '../../domain/repositories/IUserInteractionRepository';
import { UserInteraction, InteractionType } from '../../domain/entities/UserInteraction';
import { supabase } from '../supabaseClient';
import { Database } from '../supabase/types.generated';

type UserInteractionRow = Database['public']['Tables']['user_interactions']['Row'];

export class SupabaseUserInteractionRepository implements IUserInteractionRepository {
  async saveInteraction(
    userId: string,
    bookId: string,
    interactionType: InteractionType
  ): Promise<UserInteraction> {
    const insertData = {
      user_id: userId,
      book_id: bookId,
      interaction_type: interactionType,
    };

    const { data, error } = await supabase
      .from('user_interactions')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(insertData as any, {
        onConflict: 'user_id,book_id',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save interaction: ${error?.message}`);
    }

    const row = data as UserInteractionRow;
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      interactionType: row.interaction_type as InteractionType,
      createdAt: new Date(row.created_at),
    };
  }

  async getUserInteraction(userId: string, bookId: string): Promise<UserInteraction | null> {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as UserInteractionRow;
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      interactionType: row.interaction_type as InteractionType,
      createdAt: new Date(row.created_at),
    };
  }

  async getUserInteractions(
    userId: string,
    interactionType?: InteractionType
  ): Promise<UserInteraction[]> {
    let query = supabase.from('user_interactions').select('*').eq('user_id', userId);

    if (interactionType) {
      query = query.eq('interaction_type', interactionType);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as UserInteractionRow[]).map((item) => ({
      id: item.id,
      userId: item.user_id,
      bookId: item.book_id,
      interactionType: item.interaction_type as InteractionType,
      createdAt: new Date(item.created_at),
    }));
  }

  async getLikedBooks(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('book_id')
      .eq('user_id', userId)
      .eq('interaction_type', InteractionType.LIKE)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as Pick<UserInteractionRow, 'book_id'>[]).map((item) => item.book_id);
  }

  async getPurchasedBooks(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_interactions')
      .select('book_id')
      .eq('user_id', userId)
      .eq('interaction_type', InteractionType.PURCHASE);

    if (error || !data) {
      return [];
    }

    return (data as Pick<UserInteractionRow, 'book_id'>[]).map((item) => item.book_id);
  }

  async removeInteraction(userId: string, bookId: string): Promise<void> {
    await supabase.from('user_interactions').delete().eq('user_id', userId).eq('book_id', bookId);
  }

  async deleteInteraction(userId: string, bookId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    return !error;
  }
}
