/**
 * Test suite for auth error sanitization
 */

import { sanitizeAuthError, sanitizeOAuthError, AUTH_ERROR_MESSAGES } from '../../../../src/infrastructure/security/authErrors';

// Mock analytics
jest.mock('../../../../src/infrastructure/analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
  AnalyticsEvent: {
    LOGIN_FAILED: 'login_failed',
    ERROR_OCCURRED: 'error_occurred',
  },
}));

describe('Auth Error Sanitization', () => {
  beforeEach(() => {
    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sanitizeAuthError - Login context', () => {
    it('should sanitize "Invalid login credentials" error', () => {
      const error = new Error('Invalid login credentials');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
      expect(result).not.toContain('credentials');
      expect(result).not.toContain('Invalid');
    });

    it('should sanitize "Invalid email or password" error', () => {
      const error = new Error('Invalid email or password');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
    });

    it('should sanitize "Email not confirmed" error', () => {
      const error = new Error('Email not confirmed');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
      expect(result).not.toContain('not confirmed');
    });

    it('should sanitize network errors', () => {
      const error = new Error('Failed to fetch');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should sanitize rate limit errors', () => {
      const error = new Error('Too many requests');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.RATE_LIMITED);
    });

    it('should return generic message for unknown login errors', () => {
      const error = new Error('Some random database error');
      const result = sanitizeAuthError(error, 'login');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
    });
  });

  describe('sanitizeAuthError - Signup context', () => {
    it('should sanitize "User already registered" error', () => {
      const error = new Error('User already registered');
      const result = sanitizeAuthError(error, 'signup');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.EMAIL_IN_USE);
      expect(result).not.toContain('already registered');
      expect(result).not.toContain('User');
    });

    it('should sanitize "Email already registered" error', () => {
      const error = new Error('Email already registered');
      const result = sanitizeAuthError(error, 'signup');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.EMAIL_IN_USE);
    });

    it('should sanitize "Email already exists" error', () => {
      const error = new Error('Email already exists');
      const result = sanitizeAuthError(error, 'signup');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.EMAIL_IN_USE);
    });

    it('should sanitize weak password errors', () => {
      const error = new Error('Password should be at least 8 characters');
      const result = sanitizeAuthError(error, 'signup');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.WEAK_PASSWORD);
    });

    it('should return generic message for unknown signup errors', () => {
      const error = new Error('Some random error');
      const result = sanitizeAuthError(error, 'signup');
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.SIGNUP_FAILED);
    });
  });

  describe('sanitizeOAuthError', () => {
    it('should sanitize OAuth errors', () => {
      const error = new Error('OAuth provider failed');
      const result = sanitizeOAuthError(error);
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.OAUTH_ERROR);
      expect(result).not.toContain('OAuth');
      expect(result).not.toContain('provider');
    });

    it('should sanitize provider errors', () => {
      const error = new Error('Provider error: Google authentication failed');
      const result = sanitizeOAuthError(error);
      
      expect(result).toBe(AUTH_ERROR_MESSAGES.OAUTH_ERROR);
      expect(result).not.toContain('Google');
    });
  });

  describe('Console logging', () => {
    it('should log detailed error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const error = new Error('Detailed error message');
      
      sanitizeAuthError(error, 'login');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Auth Error]',
        expect.objectContaining({
          context: 'login',
          errorName: 'Error',
          errorMessage: 'Detailed error message',
        })
      );
    });
  });

  describe('User enumeration prevention', () => {
    it('should return same message for existing and non-existing users', () => {
      const existingUserError = new Error('Invalid login credentials');
      const nonExistingUserError = new Error('User not found');
      
      const result1 = sanitizeAuthError(existingUserError, 'login');
      const result2 = sanitizeAuthError(nonExistingUserError, 'login');
      
      // Both should return generic message
      expect(result1).toBe(result2);
      expect(result1).toBe(AUTH_ERROR_MESSAGES.LOGIN_FAILED);
    });

    it('should not reveal if email exists in signup', () => {
      const emailExistsError = new Error('Email already exists');
      const result = sanitizeAuthError(emailExistsError, 'signup');
      
      expect(result).not.toContain('exists');
      expect(result).not.toContain('already');
      expect(result).toBe(AUTH_ERROR_MESSAGES.EMAIL_IN_USE);
    });
  });

  describe('Error message constants', () => {
    it('should have all required error messages', () => {
      expect(AUTH_ERROR_MESSAGES.LOGIN_FAILED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.SIGNUP_FAILED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.EMAIL_IN_USE).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.RATE_LIMITED).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.GENERIC_ERROR).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.WEAK_PASSWORD).toBeDefined();
      expect(AUTH_ERROR_MESSAGES.OAUTH_ERROR).toBeDefined();
    });

    it('should have user-friendly messages', () => {
      expect(AUTH_ERROR_MESSAGES.LOGIN_FAILED).toContain('Email o password');
      expect(AUTH_ERROR_MESSAGES.SIGNUP_FAILED).toContain('Impossibile');
      expect(AUTH_ERROR_MESSAGES.NETWORK_ERROR).toContain('connessione');
    });

    it('should not expose technical details', () => {
      const messages = Object.values(AUTH_ERROR_MESSAGES);
      
      messages.forEach(msg => {
        expect(msg).not.toContain('database');
        expect(msg).not.toContain('server');
        expect(msg).not.toContain('SQL');
        expect(msg).not.toContain('error code');
      });
    });
  });
});
