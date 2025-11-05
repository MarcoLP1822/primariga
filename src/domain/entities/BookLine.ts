/**
 * BookLine Entity
 * Rappresenta la prima riga di un libro
 */
export interface BookLine {
  id: string;
  bookId: string;
  lineText: string;
  lineNumber: number;
  createdAt: Date;
}

/**
 * Factory per creare un BookLine da dati raw
 */
export function createBookLine(data: {
  id: string;
  book_id: string;
  line_text: string;
  line_number: number;
  created_at: string;
}): BookLine {
  return {
    id: data.id,
    bookId: data.book_id,
    lineText: data.line_text,
    lineNumber: data.line_number,
    createdAt: new Date(data.created_at),
  };
}
