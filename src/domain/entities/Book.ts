/**
 * Book Entity
 * Rappresenta un libro nel catalogo
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  publisher?: string;
  publicationYear?: number;
  genres: string[];
  description?: string;
  pageCount?: number;
  language: string;
  amazonLink?: string;
  ibsLink?: string;
  mondadoriLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory per creare un Book da dati raw
 */
export function createBook(data: {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  cover_image_url?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  genre?: string[] | null;
  description?: string | null;
  page_count?: number | null;
  language: string;
  amazon_link?: string | null;
  ibs_link?: string | null;
  mondadori_link?: string | null;
  created_at: string;
  updated_at: string;
}): Book {
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    isbn: data.isbn ?? undefined,
    coverImageUrl: data.cover_image_url ?? undefined,
    publisher: data.publisher ?? undefined,
    publicationYear: data.publication_year ?? undefined,
    genres: data.genre ?? [],
    description: data.description ?? undefined,
    pageCount: data.page_count ?? undefined,
    language: data.language,
    amazonLink: data.amazon_link ?? undefined,
    ibsLink: data.ibs_link ?? undefined,
    mondadoriLink: data.mondadori_link ?? undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
