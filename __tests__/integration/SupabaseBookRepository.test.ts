import { SupabaseBookRepository } from '../../src/data/repositories/SupabaseBookRepository';
import { supabase } from '../../src/data/supabaseClient';

// Mock Supabase client
jest.mock('../../src/data/supabaseClient');

describe('SupabaseBookRepository Integration', () => {
  let repository: SupabaseBookRepository;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;

  beforeEach(() => {
    repository = new SupabaseBookRepository();
    jest.clearAllMocks();
  });

  describe('getBookById', () => {
    it('should fetch a specific book by ID', async () => {
      // Arrange
      const bookId = '123';
      const mockBookData = {
        id: bookId,
        title: 'Specific Book',
        author: 'Specific Author',
        genre: ['Mystery'],
        language: 'en',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookData,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getBookById(bookId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(bookId);
      expect(result?.title).toBe('Specific Book');
    });

    it('should return null when book is not found', async () => {
      // Arrange
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getBookById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getBookLine', () => {
    it('should fetch the first line of a book', async () => {
      // Arrange
      const bookId = '123';
      const mockLineData = {
        id: 'line-1',
        book_id: bookId,
        line_text: 'In the beginning...',
        line_number: 1,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockLineData,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getBookLine(bookId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.bookId).toBe(bookId);
      expect(result?.lineText).toBe('In the beginning...');
    });

    it('should return null when book line is not found', async () => {
      // Arrange
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      // Act
      const result = await repository.getBookLine('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});
