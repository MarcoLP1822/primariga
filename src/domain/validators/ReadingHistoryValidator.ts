import { z } from 'zod';

/**
 * ReadingHistory Validation Schema
 */
export const ReadingHistorySchema = z.object({
  id: z.string().uuid('ID deve essere un UUID valido'),
  userId: z.string().uuid('User ID deve essere un UUID valido'),
  bookId: z.string().uuid('Book ID deve essere un UUID valido'),
  readAt: z.date(),
  readingDurationSeconds: z
    .number()
    .int()
    .nonnegative('Durata deve essere non negativa')
    .optional()
    .nullable(),
  createdAt: z.date(),
});

export const CreateReadingHistorySchema = ReadingHistorySchema.omit({
  id: true,
  createdAt: true,
});

export type ReadingHistoryInput = z.infer<typeof ReadingHistorySchema>;
export type CreateReadingHistoryInput = z.infer<typeof CreateReadingHistorySchema>;

export function validateReadingHistory(data: unknown): ReadingHistoryInput {
  return ReadingHistorySchema.parse(data);
}

export function validateCreateReadingHistory(data: unknown): CreateReadingHistoryInput {
  return CreateReadingHistorySchema.parse(data);
}

export function safeValidateReadingHistory(data: unknown) {
  return ReadingHistorySchema.safeParse(data);
}
