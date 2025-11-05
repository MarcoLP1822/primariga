import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Verifica che le variabili d'ambiente siano configurate
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

/**
 * Client Supabase configurato per React Native
 * Utilizza AsyncStorage per la persistenza della sessione
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Database Types generati da Supabase
 * TODO: Generare automaticamente con supabase gen types typescript
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          cover_image_url: string | null;
          publisher: string | null;
          publication_year: number | null;
          genre: string[] | null;
          description: string | null;
          page_count: number | null;
          language: string;
          amazon_link: string | null;
          ibs_link: string | null;
          mondadori_link: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      book_lines: {
        Row: {
          id: string;
          book_id: string;
          line_text: string;
          line_number: number;
          created_at: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          interaction_type: 'like' | 'dislike' | 'skip' | 'purchase';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          interaction_type: 'like' | 'dislike' | 'skip' | 'purchase';
          created_at?: string;
        };
      };
      user_reading_history: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          read_at: string;
          reading_duration_seconds: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          read_at?: string;
          reading_duration_seconds?: number | null;
        };
      };
    };
  };
}
