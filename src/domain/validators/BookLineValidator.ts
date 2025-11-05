import { z } from 'zod';

/**
 * BookLine Validation Schema
 */
export const BookLineSchema = z.object({
  id: z.string().uuid('ID deve essere un UUID valido'),
  bookId: z.string().uuid('Book ID deve essere un UUID valido'),
  lineText: z.string().min(1, 'Testo della riga obbligatorio').max(1000, 'Testo troppo lungo'),
  lineNumber: z.number().int().positive('Numero riga deve essere positivo'),
  createdAt: z.date(),
});

export const CreateBookLineSchema = BookLineSchema.omit({
  id: true,
  createdAt: true,
});

export type BookLineInput = z.infer<typeof BookLineSchema>;
export type CreateBookLineInput = z.infer<typeof CreateBookLineSchema>;

export function validateBookLine(data: unknown): BookLineInput {
  return BookLineSchema.parse(data);
}

export function safeValidateBookLine(data: unknown) {
  return BookLineSchema.safeParse(data);
}
