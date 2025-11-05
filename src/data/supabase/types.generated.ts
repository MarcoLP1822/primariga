/**
 * Supabase Database Types
 * 
 * Questo file verrà sovrascritto quando esegui:
 *   npm run types:generate
 * 
 * Per ora contiene un template base che segue la struttura del database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          isbn: string | null
          cover_image_url: string | null
          publisher: string | null
          publication_year: number | null
          genre: string[] | null
          description: string | null
          page_count: number | null
          language: string
          amazon_link: string | null
          ibs_link: string | null
          mondadori_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          isbn?: string | null
          cover_image_url?: string | null
          publisher?: string | null
          publication_year?: number | null
          genre?: string[] | null
          description?: string | null
          page_count?: number | null
          language?: string
          amazon_link?: string | null
          ibs_link?: string | null
          mondadori_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          isbn?: string | null
          cover_image_url?: string | null
          publisher?: string | null
          publication_year?: number | null
          genre?: string[] | null
          description?: string | null
          page_count?: number | null
          language?: string
          amazon_link?: string | null
          ibs_link?: string | null
          mondadori_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      book_lines: {
        Row: {
          id: string
          book_id: string
          line_text: string
          line_number: number
          created_at: string
        }
        Insert: {
          id?: string
          book_id: string
          line_text: string
          line_number: number
          created_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          line_text?: string
          line_number?: number
          created_at?: string
        }
      }
      user_reading_history: {
        Row: {
          id: string
          user_id: string
          book_id: string
          read_at: string
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          read_at?: string
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          read_at?: string
          duration_seconds?: number | null
          created_at?: string
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          book_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          interaction_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_book_view: {
        Args: { book_id: string }
        Returns: void
      }
      increment_book_click: {
        Args: { book_id: string }
        Returns: void
      }
    }
    Enums: {
      interaction_type: 'like' | 'dislike' | 'skip' | 'purchase'
    }
  }
}
