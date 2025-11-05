import { z } from 'zod';

/**
 * User Interaction Types
 */
export const InteractionTypeEnum = z.enum(['like', 'dislike', 'skip', 'purchase', 'share']);

/**
 * UserInteraction Validation Schema
 */
export const UserInteractionSchema = z.object({
  id: z.string().uuid('ID deve essere un UUID valido'),
  userId: z.string().uuid('User ID deve essere un UUID valido'),
  bookId: z.string().uuid('Book ID deve essere un UUID valido'),
  interactionType: InteractionTypeEnum,
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.date(),
});

export const CreateUserInteractionSchema = UserInteractionSchema.omit({
  id: true,
  createdAt: true,
});

export type UserInteractionInput = z.infer<typeof UserInteractionSchema>;
export type CreateUserInteractionInput = z.infer<typeof CreateUserInteractionSchema>;
export type InteractionType = z.infer<typeof InteractionTypeEnum>;

export function validateUserInteraction(data: unknown): UserInteractionInput {
  return UserInteractionSchema.parse(data);
}

export function validateCreateUserInteraction(data: unknown): CreateUserInteractionInput {
  return CreateUserInteractionSchema.parse(data);
}

export function safeValidateUserInteraction(data: unknown) {
  return UserInteractionSchema.safeParse(data);
}
