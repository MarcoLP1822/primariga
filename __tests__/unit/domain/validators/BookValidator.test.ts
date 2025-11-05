import {
  BookSchema,
  CreateBookSchema,
  validateBook,
  validateCreateBook,
  safeValidateBook,
} from '../../../../src/domain/validators/BookValidator';
import { ZodError } from 'zod';

describe('BookValidator', () => {
  const validBook = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genres: ['Fiction', 'Classic'],
    language: 'en',
    publicationYear: 1925,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('validateBook', () => {
    it('should validate a valid book', () => {
      const result = validateBook(validBook);
      expect(result).toEqual(validBook);
    });

    it('should throw error for missing required fields', () => {
      const invalidBook = { ...validBook, title: undefined };
      expect(() => validateBook(invalidBook)).toThrow(ZodError);
    });

    it('should throw error for invalid UUID', () => {
      const invalidBook = { ...validBook, id: 'invalid-uuid' };
      expect(() => validateBook(invalidBook)).toThrow(ZodError);
    });

    it('should throw error for empty title', () => {
      const invalidBook = { ...validBook, title: '' };
      expect(() => validateBook(invalidBook)).toThrow('Titolo obbligatorio');
    });

    it('should throw error for future publication year', () => {
      const invalidBook = { ...validBook, publicationYear: 2099 };
      expect(() => validateBook(invalidBook)).toThrow('Anno non può essere futuro');
    });

    it('should throw error for invalid language code', () => {
      const invalidBook = { ...validBook, language: 'invalid' };
      expect(() => validateBook(invalidBook)).toThrow('Codice lingua deve essere 2 caratteri');
    });
  });

  describe('validateCreateBook', () => {
    it('should validate book creation without ID and timestamps', () => {
      const createBookData = {
        title: 'New Book',
        author: 'New Author',
        genres: ['Mystery'],
        language: 'it',
      };
      const result = validateCreateBook(createBookData);
      expect(result.title).toBe('New Book');
      expect(result.genres).toEqual(['Mystery']);
    });
  });

  describe('safeValidateBook', () => {
    it('should return success=true for valid book', () => {
      const result = safeValidateBook(validBook);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validBook);
      }
    });

    it('should return success=false for invalid book', () => {
      const invalidBook = { ...validBook, title: '' };
      const result = safeValidateBook(invalidBook);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should handle optional fields', () => {
      const bookWithOptionals = {
        ...validBook,
        isbn: '978-0-7432-7356-5',
        publisher: 'Scribner',
        coverImageUrl: 'https://example.com/cover.jpg',
      };
      const result = safeValidateBook(bookWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should handle null optional fields', () => {
      const bookWithNulls = {
        ...validBook,
        isbn: null,
        publisher: null,
        description: null,
      };
      const result = safeValidateBook(bookWithNulls);
      expect(result.success).toBe(true);
    });
  });
});
