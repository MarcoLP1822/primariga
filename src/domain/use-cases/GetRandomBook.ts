import { Book } from '../entities/Book';
import { IBookRepository } from '../repositories/IBookRepository';

export class GetRandomBook {
  constructor(private bookRepository: IBookRepository) {}

  async execute(excludeBookIds?: string[]): Promise<Book | null> {
    // Ottiene un libro casuale, escludendo quelli già visti dall'utente
    const book = await this.bookRepository.getRandomBook(excludeBookIds);
    return book;
  }
}
