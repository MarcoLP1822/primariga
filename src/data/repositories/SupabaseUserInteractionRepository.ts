import { IUserInteractionRepository } from '../../domain/repositories/IUserInteractionRepository';
import { UserInteraction, InteractionType } from '../../domain/entities/UserInteraction';
import { supabase } from '../supabaseClient';

export class SupabaseUserInteractionRepository implements IUserInteractionRepository {
  async saveInteraction(
    userId: string,
    bookId: string,
    interactionType: InteractionType
  ): Promise<UserInteraction> {
    const { data, error } = await supabase
      .from('user_interactions')
      .upsert(
        {
          user_id: userId,
          book_id: bookId,
          interaction_type: interactionType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,book_id',
        }
      )
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save interaction: ${error?.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      interactionType: data.interaction_type as InteractionType,
      createdAt: new Date(data.created_at),
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

    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      interactionType: data.interaction_type as InteractionType,
      createdAt: new Date(data.created_at),
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

    return data.map((item) => ({
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

    return data.map((item) => item.book_id);
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

    return data.map((item) => item.book_id);
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
