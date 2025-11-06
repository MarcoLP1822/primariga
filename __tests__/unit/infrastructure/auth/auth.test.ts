import { AuthService } from '../../../../src/infrastructure/auth';
import { supabase } from '../../../../src/data/supabaseClient';
import {
  AuthenticationError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
} from '../../../../src/core/errors/AppError';
import type { Session, User } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('../../../../src/data/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      refreshSession: jest.fn(),
      resend: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location for all tests
    global.window = { location: { origin: 'http://localhost' } } as any;
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      // Mock window.location for emailRedirectTo
      global.window = { location: { origin: 'http://localhost' } } as any;

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        username: 'testuser',
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            username: 'testuser',
          },
          emailRedirectTo: expect.any(String),
        },
      });
    });

    it('should fail with ValidationError for existing user', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          status: 400,
        },
      });

      const result = await AuthService.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error?.message).toContain('esiste già');
    });

    it('should fail with ValidationError for weak password', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Password should be at least 6 characters',
          status: 400,
        },
      });

      const result = await AuthService.signUp({
        email: 'test@example.com',
        password: '123',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(ValidationError);
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should fail with AuthenticationError for invalid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 401,
        },
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(AuthenticationError);
      expect(result.error?.message).toContain('non validi');
    });

    it('should fail with AuthenticationError for unverified email', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Email not confirmed',
          status: 401,
        },
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(AuthenticationError);
      expect(result.error?.message).toContain('non verificata');
    });

    it('should fail with RateLimitError when rate limited', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Too many requests',
          status: 429,
        },
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(RateLimitError);
    });

    it('should fail with ExternalServiceError for server errors', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Internal server error',
          status: 500,
        },
      });

      const result = await AuthService.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(ExternalServiceError);
    });
  });

  describe('signInWithOAuth', () => {
    it('should successfully initiate OAuth flow', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await AuthService.signInWithOAuth({
        provider: 'google',
        redirectTo: 'myapp://auth/callback',
      });

      expect(result.isSuccess()).toBe(true);
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'myapp://auth/callback',
          skipBrowserRedirect: false,
        },
      });
    });

    it('should fail with error', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: {},
        error: {
          message: 'OAuth provider not configured',
          status: 400,
        },
      });

      const result = await AuthService.signInWithOAuth({
        provider: 'apple',
      });

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.signOut();

      expect(result.isSuccess()).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: {
          message: 'Sign out failed',
          status: 400,
        },
      });

      const result = await AuthService.signOut();

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should successfully send reset password email', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.resetPassword({
        email: 'test@example.com',
      });

      expect(result.isSuccess()).toBe(true);
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: {
          message: 'User not found',
          status: 404,
        },
      });

      const result = await AuthService.resetPassword({
        email: 'nonexistent@example.com',
      });

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.updatePassword({
        newPassword: 'newpassword123',
      });

      expect(result.isSuccess()).toBe(true);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should handle update errors', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Password update failed',
          status: 400,
        },
      });

      const result = await AuthService.updatePassword({
        newPassword: 'newpassword123',
      });

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const session = await AuthService.getSession();

      expect(session).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null if no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const session = await AuthService.getSession();

      expect(session).toBeNull();
    });

    it('should return null on error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      const session = await AuthService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await AuthService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null if no user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await AuthService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if session exists', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false if no session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockUnsubscribe = jest.fn();
      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      const callback = jest.fn();
      const unsubscribe = AuthService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.refreshSession();

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual(mockSession);
    });

    it('should fail if session cannot be refreshed', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: {
          message: 'Refresh failed',
          status: 401,
        },
      });

      const result = await AuthService.refreshSession();

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should successfully resend verification email', async () => {
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await AuthService.resendVerificationEmail('test@example.com');

      expect(result.isSuccess()).toBe(true);
      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
    });

    it('should handle resend errors', async () => {
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        error: {
          message: 'Resend failed',
          status: 400,
        },
      });

      const result = await AuthService.resendVerificationEmail('test@example.com');

      expect(result.isFailure()).toBe(true);
    });
  });
});
