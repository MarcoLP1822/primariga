import { z } from 'zod';

/**
 * Book Validation Schema
 *
 * Definisce le regole di validazione per l'entità Book
 */
export const BookSchema = z.object({
  id: z.string().uuid('ID deve essere un UUID valido'),
  title: z.string().min(1, 'Titolo obbligatorio').max(500, 'Titolo troppo lungo'),
  author: z.string().min(1, 'Autore obbligatorio').max(200, 'Nome autore troppo lungo'),
  isbn: z
    .string()
    .regex(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      'ISBN non valido'
    )
    .optional()
    .nullable(),
  coverImageUrl: z.string().url('URL copertina non valido').optional().nullable(),
  publisher: z.string().max(200, 'Nome editore troppo lungo').optional().nullable(),
  publicationYear: z
    .number()
    .int('Anno deve essere un numero intero')
    .min(1000, 'Anno non valido')
    .max(new Date().getFullYear() + 1, 'Anno non può essere futuro')
    .optional()
    .nullable(),
  genres: z.array(z.string()).default([]),
  description: z.string().max(5000, 'Descrizione troppo lunga').optional().nullable(),
  pageCount: z.number().int().positive('Pagine deve essere positivo').optional().nullable(),
  language: z
    .string()
    .length(2, 'Codice lingua deve essere 2 caratteri (es. "it", "en")')
    .default('it'),
  amazonLink: z.string().url('URL Amazon non valido').optional().nullable(),
  ibsLink: z.string().url('URL IBS non valido').optional().nullable(),
  mondadoriLink: z.string().url('URL Mondadori non valido').optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema per la creazione di un nuovo libro (senza ID e timestamps)
 */
export const CreateBookSchema = BookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema per l'aggiornamento di un libro (tutti i campi opzionali tranne ID)
 */
export const UpdateBookSchema = BookSchema.partial().required({ id: true });

/**
 * Type inference da Zod schema
 */
export type BookInput = z.infer<typeof BookSchema>;
export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;

/**
 * Validazione helper
 */
export function validateBook(data: unknown): BookInput {
  return BookSchema.parse(data);
}

export function validateCreateBook(data: unknown): CreateBookInput {
  return CreateBookSchema.parse(data);
}

export function validateUpdateBook(data: unknown): UpdateBookInput {
  return UpdateBookSchema.parse(data);
}

/**
 * Safe parse (ritorna { success: boolean, data?: T, error?: ZodError })
 */
export function safeValidateBook(data: unknown) {
  return BookSchema.safeParse(data);
}
