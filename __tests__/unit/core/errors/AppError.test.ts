import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  DatabaseError,
  NetworkError,
  BusinessLogicError,
  isAppError,
  isValidationError,
  createError,
} from '../../../../src/core/errors/AppError';

describe('AppError', () => {
  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid data');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid data');
    });

    it('should include field errors', () => {
      const fields = {
        email: ['Email is required'],
        password: ['Password too short'],
      };
      const error = new ValidationError('Validation failed', fields);
      expect(error.fields).toEqual(fields);
    });

    it('should serialize to JSON', () => {
      const error = new ValidationError('Test');
      const json = error.toJSON();
      expect(json).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(json).toHaveProperty('message', 'Test');
      expect(json).toHaveProperty('statusCode', 400);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with ID', () => {
      const error = new NotFoundError('Book', '123');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('Book');
      expect(error.message).toContain('123');
    });

    it('should create not found error without ID', () => {
      const error = new NotFoundError('Book');
      expect(error.message).toContain('Book');
      expect(error.message).not.toContain('ID');
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Login required');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Autenticazione richiesta');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const originalError = new Error('Connection failed');
      const error = new DatabaseError('DB Error', originalError);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with URL', () => {
      const error = new NetworkError('Failed to fetch', 'https://api.example.com');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(503);
      expect(error.url).toBe('https://api.example.com');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error', () => {
      const error = new BusinessLogicError('Invalid operation');
      expect(error.code).toBe('BUSINESS_LOGIC_ERROR');
      expect(error.statusCode).toBe(422);
    });
  });

  describe('Type guards', () => {
    it('should identify AppError', () => {
      const error = new ValidationError('test');
      expect(isAppError(error)).toBe(true);
      expect(isAppError(new Error('test'))).toBe(false);
    });

    it('should identify ValidationError', () => {
      const error = new ValidationError('test');
      expect(isValidationError(error)).toBe(true);
      expect(isValidationError(new NotFoundError('test'))).toBe(false);
    });
  });

  describe('createError factory', () => {
    it('should create validation error', () => {
      const error = createError('validation', 'Invalid', { fields: {} });
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should create not found error', () => {
      const error = createError('notFound', 'Not found', { resource: 'Book', id: '123' });
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should create database error', () => {
      const error = createError('database', 'DB failed');
      expect(error).toBeInstanceOf(DatabaseError);
    });

    it('should default to business error', () => {
      const error = createError('business', 'Business rule violated');
      expect(error).toBeInstanceOf(BusinessLogicError);
    });
  });
});
