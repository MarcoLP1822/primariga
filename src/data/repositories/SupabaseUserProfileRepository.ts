import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile } from '../../domain/entities/UserProfile';
import { supabase } from '../supabaseClient';

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  async getCurrentProfile(): Promise<UserProfile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return this.getById(user.id);
  }

  async getById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    return this.getById(userId);
  }

  async create(profile: Omit<UserProfile, 'updatedAt'>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        created_at: profile.createdAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create profile: ${error?.message}`);
    }

    return {
      id: data.id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateProfile(
    data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error || !updatedData) {
      throw new Error(`Failed to update profile: ${error?.message}`);
    }

    return {
      id: updatedData.id,
      createdAt: new Date(updatedData.created_at),
      updatedAt: new Date(updatedData.updated_at),
    };
  }

  async searchByUsername(username: string): Promise<UserProfile[]> {
    // Per ora ritorna array vuoto - non abbiamo username nella tabella profiles
    return [];
  }
}
