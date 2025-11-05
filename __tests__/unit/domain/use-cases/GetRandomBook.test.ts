import { GetRandomBook } from '../../../../src/domain/use-cases/GetRandomBook';
import { IBookRepository } from '../../../../src/domain/repositories/IBookRepository';
import { Book } from '../../../../src/domain/entities/Book';

// Mock repository
const mockBookRepository: jest.Mocked<IBookRepository> = {
  getRandomBook: jest.fn(),
  getBookById: jest.fn(),
  getBookLine: jest.fn(),
  searchBooks: jest.fn(),
  getBooksByGenre: jest.fn(),
  getBooksByAuthor: jest.fn(),
  getRecommendedBooks: jest.fn(),
};

describe('GetRandomBook Use Case', () => {
  let useCase: GetRandomBook;

  beforeEach(() => {
    useCase = new GetRandomBook(mockBookRepository);
    jest.clearAllMocks();
  });

  it('should return a random book successfully', async () => {
    // Arrange
    const mockBook: Book = {
      id: '123',
      title: 'Test Book',
      author: 'Test Author',
      genres: ['Fiction'],
      language: 'it',
      publicationYear: 2020,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookRepository.getRandomBook.mockResolvedValue(mockBook);

    // Act
    const result = await useCase.execute([]);

    // Assert
    expect(result).toEqual(mockBook);
    expect(mockBookRepository.getRandomBook).toHaveBeenCalledWith([]);
    expect(mockBookRepository.getRandomBook).toHaveBeenCalledTimes(1);
  });

  it('should exclude seen books when fetching random book', async () => {
    // Arrange
    const seenBookIds = ['book1', 'book2', 'book3'];
    const mockBook: Book = {
      id: 'book4',
      title: 'New Book',
      author: 'New Author',
      genres: ['Mystery'],
      language: 'en',
      publicationYear: 2021,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookRepository.getRandomBook.mockResolvedValue(mockBook);

    // Act
    const result = await useCase.execute(seenBookIds);

    // Assert
    expect(result).toEqual(mockBook);
    expect(mockBookRepository.getRandomBook).toHaveBeenCalledWith(seenBookIds);
  });

  it('should return null when no books are available', async () => {
    // Arrange
    mockBookRepository.getRandomBook.mockResolvedValue(null);

    // Act
    const result = await useCase.execute([]);

    // Assert
    expect(result).toBeNull();
    expect(mockBookRepository.getRandomBook).toHaveBeenCalledTimes(1);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const error = new Error('Database connection failed');
    mockBookRepository.getRandomBook.mockRejectedValue(error);

    // Act & Assert
    await expect(useCase.execute([])).rejects.toThrow('Database connection failed');
  });
});
