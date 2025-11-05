import { Book, BookLine } from '../entities';

/**
 * Filtri per la ricerca di libri
 */
export interface BookFilters {
  genres?: string[];
  author?: string;
  language?: string;
  publicationYearFrom?: number;
  publicationYearTo?: number;
  limit?: number;
  offset?: number;
}

/**
 * Repository interface per Books
 */
export interface IBookRepository {
  /**
   * Ottiene un libro casuale (per la schermata principale)
   */
  getRandomBook(excludeIds?: string[]): Promise<Book | null>;

  /**
   * Ottiene un libro per ID
   */
  getBookById(bookId: string): Promise<Book | null>;

  /**
   * Ottiene la prima riga di un libro
   */
  getBookLine(bookId: string): Promise<BookLine | null>;

  /**
   * Cerca libri con filtri
   */
  searchBooks(query: string, filters?: BookFilters, limit?: number): Promise<Book[]>;

  /**
   * Ottiene libri per genere
   */
  getBooksByGenre(genre: string, limit?: number): Promise<Book[]>;

  /**
   * Ottiene libri per autore
   */
  getBooksByAuthor(author: string, limit?: number): Promise<Book[]>;

  /**
   * Ottiene libri consigliati basati sulle preferenze utente
   */
  getRecommendedBooks(userId: string, limit?: number): Promise<Book[]>;
}
