import { z } from 'zod';

/**
 * UserProfile Validation Schema
 */
export const UserProfileSchema = z.object({
  id: z.string().uuid('ID deve essere un UUID valido'),
  username: z
    .string()
    .min(3, 'Username deve essere almeno 3 caratteri')
    .max(30, 'Username max 30 caratteri')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username può contenere solo lettere, numeri e underscore')
    .optional()
    .nullable(),
  fullName: z.string().max(100, 'Nome troppo lungo').optional().nullable(),
  avatarUrl: z.string().url('URL avatar non valido').optional().nullable(),
  bio: z.string().max(500, 'Bio troppo lunga').optional().nullable(),
  preferredGenres: z.array(z.string()).default([]),
  preferredLanguages: z
    .array(z.string().length(2, 'Codice lingua deve essere 2 caratteri'))
    .default(['it']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserProfileSchema = UserProfileSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserProfileSchema = UserProfileSchema.partial().required({ id: true });

export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type CreateUserProfileInput = z.infer<typeof CreateUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;

export function validateUserProfile(data: unknown): UserProfileInput {
  return UserProfileSchema.parse(data);
}

export function validateUpdateUserProfile(data: unknown): UpdateUserProfileInput {
  return UpdateUserProfileSchema.parse(data);
}

export function safeValidateUserProfile(data: unknown) {
  return UserProfileSchema.safeParse(data);
}
