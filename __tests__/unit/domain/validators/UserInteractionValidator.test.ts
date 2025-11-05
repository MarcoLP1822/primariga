import {
  UserInteractionSchema,
  CreateUserInteractionSchema,
  InteractionTypeEnum,
  validateUserInteraction,
  validateCreateUserInteraction,
  safeValidateUserInteraction,
} from '../../../../src/domain/validators/UserInteractionValidator';
import { ZodError } from 'zod';

describe('UserInteractionValidator', () => {
  const validInteraction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    bookId: '123e4567-e89b-12d3-a456-426614174002',
    interactionType: 'like' as const,
    createdAt: new Date(),
  };

  describe('validateUserInteraction', () => {
    it('should validate a valid interaction', () => {
      const result = validateUserInteraction(validInteraction);
      expect(result).toEqual(validInteraction);
    });

    it('should accept all interaction types', () => {
      const types = ['like', 'dislike', 'skip', 'purchase', 'share'];
      types.forEach((type) => {
        const interaction = { ...validInteraction, interactionType: type };
        expect(() => validateUserInteraction(interaction)).not.toThrow();
      });
    });

    it('should throw error for invalid interaction type', () => {
      const invalidInteraction = { ...validInteraction, interactionType: 'invalid' };
      expect(() => validateUserInteraction(invalidInteraction)).toThrow(ZodError);
    });

    it('should throw error for invalid UUIDs', () => {
      const invalidInteraction = { ...validInteraction, userId: 'not-a-uuid' };
      expect(() => validateUserInteraction(invalidInteraction)).toThrow(ZodError);
    });

    it('should handle optional metadata', () => {
      const interactionWithMetadata = {
        ...validInteraction,
        metadata: { source: 'mobile', version: '1.0.0' },
      };
      const result = validateUserInteraction(interactionWithMetadata);
      expect(result.metadata).toEqual({ source: 'mobile', version: '1.0.0' });
    });
  });

  describe('validateCreateUserInteraction', () => {
    it('should validate interaction creation without ID and timestamps', () => {
      const createData = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        bookId: '123e4567-e89b-12d3-a456-426614174002',
        interactionType: 'like' as const,
      };
      const result = validateCreateUserInteraction(createData);
      expect(result.userId).toBe(createData.userId);
      expect(result.interactionType).toBe('like');
    });
  });

  describe('safeValidateUserInteraction', () => {
    it('should return success=true for valid interaction', () => {
      const result = safeValidateUserInteraction(validInteraction);
      expect(result.success).toBe(true);
    });

    it('should return success=false for invalid interaction', () => {
      const invalidInteraction = { ...validInteraction, interactionType: 'bad' };
      const result = safeValidateUserInteraction(invalidInteraction);
      expect(result.success).toBe(false);
    });
  });

  describe('InteractionTypeEnum', () => {
    it('should parse valid interaction types', () => {
      expect(InteractionTypeEnum.parse('like')).toBe('like');
      expect(InteractionTypeEnum.parse('dislike')).toBe('dislike');
      expect(InteractionTypeEnum.parse('skip')).toBe('skip');
      expect(InteractionTypeEnum.parse('purchase')).toBe('purchase');
      expect(InteractionTypeEnum.parse('share')).toBe('share');
    });

    it('should throw for invalid interaction type', () => {
      expect(() => InteractionTypeEnum.parse('invalid')).toThrow();
    });
  });
});
