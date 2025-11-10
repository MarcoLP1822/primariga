import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { UserProfile, createUserProfile } from '../../domain/entities/UserProfile';
import { supabase } from '../supabaseClient';
import type { Database } from '../supabase/types.generated';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

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

    const profile = data as ProfileRow;
    return createUserProfile(profile);
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    return this.getById(userId);
  }

  async create(profile: Omit<UserProfile, 'updatedAt'>): Promise<UserProfile> {
    const insertData: ProfileInsert = {
      id: profile.id,
      username: profile.username || null,
      full_name: profile.fullName || null,
      avatar_url: profile.avatarUrl || null,
      bio: profile.bio || null,
      role: profile.role,
      created_at: profile.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      // Type assertion needed due to Supabase client type inference limitation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create profile: ${error?.message}`);
    }

    const profileRow = data as ProfileRow;
    return createUserProfile(profileRow);
  }

  async updateProfile(
    profileData: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('No authenticated user');
    }

    const updateData: ProfileUpdate = {
      username: profileData.username,
      full_name: profileData.fullName,
      avatar_url: profileData.avatarUrl,
      bio: profileData.bio,
      role: profileData.role,
      updated_at: new Date().toISOString(),
    };

    // Type assertion needed due to Supabase client type inference limitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = supabase.from('profiles') as any;
    const { data: updatedData, error } = await query
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error || !updatedData) {
      throw new Error(`Failed to update profile: ${error?.message}`);
    }

    const profileRow = updatedData as ProfileRow;
    return createUserProfile(profileRow);
  }

  async searchByUsername(_username: string): Promise<UserProfile[]> {
    // Per ora ritorna array vuoto - non abbiamo username nella tabella profiles
    return [];
  }
}
