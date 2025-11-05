import { Book } from '../../../../src/domain/entities/Book';

describe('Book Entity', () => {
  it('should create a valid book entity', () => {
    // Arrange & Act
    const book: Book = {
      id: '123',
      title: 'Test Book',
      author: 'John Doe',
      genres: ['Fantasy'],
      language: 'en',
      publicationYear: 1937,
      isbn: '978-0-547-92822-7',
      coverImageUrl: 'https://example.com/cover.jpg',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      amazonLink: 'https://amazon.com/book',
      description: 'A test book description',
      pageCount: 300,
    };

    // Assert
    expect(book).toBeDefined();
    expect(book.id).toBe('123');
    expect(book.title).toBe('Test Book');
    expect(book.author).toBe('John Doe');
  });

  it('should allow optional fields to be undefined', () => {
    // Arrange & Act
    const minimalBook: Book = {
      id: '456',
      title: 'Minimal Book',
      author: 'Jane Smith',
      genres: ['Fiction'],
      language: 'it',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Assert
    expect(minimalBook).toBeDefined();
    expect(minimalBook.isbn).toBeUndefined();
    expect(minimalBook.coverImageUrl).toBeUndefined();
    expect(minimalBook.description).toBeUndefined();
  });

  it('should have correct data types for all fields', () => {
    // Arrange
    const book: Book = {
      id: '789',
      title: 'Type Test',
      author: 'Test Author',
      genres: ['Mystery', 'Thriller'],
      language: 'en',
      publicationYear: 2023,
      pageCount: 250,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Assert
    expect(typeof book.id).toBe('string');
    expect(typeof book.title).toBe('string');
    expect(typeof book.author).toBe('string');
    expect(Array.isArray(book.genres)).toBe(true);
    expect(typeof book.language).toBe('string');
    expect(typeof book.publicationYear).toBe('number');
    expect(typeof book.pageCount).toBe('number');
    expect(book.createdAt).toBeInstanceOf(Date);
  });
});
