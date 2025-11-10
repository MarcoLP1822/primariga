import { IBookRepository, BookFilters } from '../../domain/repositories/IBookRepository';
import { Book, BookLine } from '../../domain/entities';
import { supabase } from '../supabaseClient';

// Tipo helper per i dati grezzi dal database
type RawBookData = {
  id: string;
  title: string;
  author: string;
  genre: string[];
  language: string;
  isbn?: string;
  publication_year?: number;
  cover_image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

type RawBookLineData = {
  id: string;
  book_id: string;
  line_text: string;
  line_number: number;
  created_at: string;
};

export class SupabaseBookRepository implements IBookRepository {
  // Helper per mappare dati Supabase a Book entity
  private mapToBook(bookData: RawBookData): Book {
    return {
      id: bookData.id,
      title: bookData.title,
      author: bookData.author,
      genres: bookData.genre || [], // La colonna nel DB si chiama 'genre' non 'genres'
      language: bookData.language || 'it',
      isbn: bookData.isbn || undefined,
      publicationYear: bookData.publication_year || undefined,
      coverImageUrl: bookData.cover_image_url || undefined,
      description: bookData.description || undefined,
      createdAt: new Date(bookData.created_at),
      updatedAt: new Date(bookData.updated_at),
    };
  }

  async getRandomBook(excludeBookIds?: string[]): Promise<Book | null> {
    let query = supabase.from('books').select('*').limit(100); // Prendiamo 100 libri e ne scegliamo uno random client-side

    if (excludeBookIds && excludeBookIds.length > 0) {
      query = query.not('id', 'in', `(${excludeBookIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return null;
    }

    // Selezione casuale client-side
    const randomIndex = Math.floor(Math.random() * data.length);
    return this.mapToBook(data[randomIndex]);
  }

  async getBookById(bookId: string): Promise<Book | null> {
    const { data, error } = await supabase.from('books').select('*').eq('id', bookId).single();

    if (error || !data) {
      return null;
    }

    return this.mapToBook(data);
  }

  async getBookLine(bookId: string): Promise<BookLine | null> {
    const { data, error } = await supabase
      .from('book_lines')
      .select('*')
      .eq('book_id', bookId)
      .single();

    if (error || !data) {
      return null;
    }

    const lineData = data as unknown as RawBookLineData;
    return {
      id: lineData.id,
      bookId: lineData.book_id,
      lineText: lineData.line_text,
      lineNumber: lineData.line_number,
      createdAt: new Date(lineData.created_at),
    };
  }

  async searchBooks(query: string, filters?: BookFilters, limit: number = 20): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToBook.bind(this));
  }

  async getBooksByGenre(genre: string, limit: number = 20): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .contains('genre', [genre]) // La colonna nel DB si chiama 'genre' non 'genres'
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToBook.bind(this));
  }

  async getBooksByAuthor(author: string, limit: number = 20): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .ilike('author', `%${author}%`)
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToBook.bind(this));
  }

  async getRecommendedBooks(userId: string, limit: number = 10): Promise<Book[]> {
    // Implementa logica di raccomandazione basata su preferenze utente
    // 1. Ottieni i generi dei libri che l'utente ha apprezzato (liked)
    const { data: userLikes, error: likesError } = await supabase
      .from('user_likes')
      .select('book_id')
      .eq('user_id', userId);

    if (likesError || !userLikes || userLikes.length === 0) {
      // Nessun like trovato - ritorna libri popolari basati su view_count
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      return error || !data ? [] : data.map(this.mapToBook.bind(this));
    }

    // Cast per risolvere problemi di type inference
    type UserLike = { book_id: string };
    const typedLikes = userLikes as UserLike[];

    // Ottieni i libri che l'utente ha apprezzato per estrarre i generi
    const likedBookIds = typedLikes.map((like) => like.book_id);
    const { data: likedBooks, error: booksError } = await supabase
      .from('books')
      .select('genre')
      .in('id', likedBookIds);

    if (booksError || !likedBooks) {
      // Fallback a libri popolari
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      return error || !data ? [] : data.map(this.mapToBook.bind(this));
    }

    // Cast per type safety
    type BookGenre = { genre: string[] };
    const typedBooks = likedBooks as BookGenre[];

    // Estrai tutti i generi unici dai libri piaciuti
    const preferredGenres = Array.from(
      new Set(typedBooks.flatMap((book) => book.genre || []))
    );

    if (preferredGenres.length === 0) {
      // Nessun genere trovato - usa libri popolari
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      return error || !data ? [] : data.map(this.mapToBook.bind(this));
    }

    // Cerca libri con generi simili che l'utente non ha ancora apprezzato
    const { data: recommendations, error: recError } = await supabase
      .from('books')
      .select('*')
      .overlaps('genre', preferredGenres)
      .not('id', 'in', `(${likedBookIds.join(',')})`)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (recError || !recommendations || recommendations.length === 0) {
      // Fallback finale
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      return error || !data ? [] : data.map(this.mapToBook.bind(this));
    }

    return recommendations.map(this.mapToBook.bind(this));
  }

  async getBooksByIds(bookIds: string[]): Promise<Book[]> {
    if (bookIds.length === 0) return [];

    const { data, error } = await supabase.from('books').select('*').in('id', bookIds);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToBook.bind(this));
  }

  async getBooks(filters?: BookFilters): Promise<Book[]> {
    let query = supabase.from('books').select('*');

    // Applica filtri se presenti
    if (filters?.genres && filters.genres.length > 0) {
      query = query.overlaps('genre', filters.genres); // La colonna nel DB si chiama 'genre' non 'genres'
    }

    if (filters?.language) {
      query = query.eq('language', filters.language);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(this.mapToBook.bind(this));
  }

  async incrementViewCount(bookId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.rpc('increment_book_view', { book_id: bookId } as any);

    if (error) {
      console.error('Error incrementing view count:', error);
      // Non-blocking: analytics failure doesn't break the app
    }
  }

  async incrementClickCount(bookId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.rpc('increment_book_click', { book_id: bookId } as any);

    if (error) {
      console.error('Error incrementing click count:', error);
      // Non-blocking: analytics failure doesn't break the app
    }
  }
}
