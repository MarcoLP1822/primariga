import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../../../../app/(auth)/login';
import { AuthService } from '../../../../../src/infrastructure/auth';
import { useAppStore } from '../../../../../src/infrastructure/store/store';
import { router } from 'expo-router';
import { success, failure } from '../../../../../src/core/errors/Result';
import { AuthenticationError, ValidationError } from '../../../../../src/core/errors/AppError';
import type { Session, User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('../../../../../src/infrastructure/auth');
jest.mock('../../../../../src/infrastructure/store/store');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
  Link: ({ children }: any) => children,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockSetUser = jest.fn();
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        setUser: mockSetUser,
      };
      return selector ? selector(state) : state;
    });
  });

  it('should render login form correctly', () => {
    render(<LoginScreen />);

    expect(screen.getByText('Bentornato')).toBeTruthy();
    expect(screen.getByPlaceholderText('tua@email.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
    expect(screen.getByText('Accedi')).toBeTruthy();
    expect(screen.getByText('Password dimenticata?')).toBeTruthy();
  });

  it('should successfully login with valid credentials', async () => {
    (AuthService.signIn as jest.Mock).mockResolvedValue(success(mockSession));

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(AuthService.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockSetUser).toHaveBeenCalledWith('user-123');
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Email non valida')).toBeTruthy();
      expect(AuthService.signIn).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for short password', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Password deve contenere almeno 6 caratteri')).toBeTruthy();
      expect(AuthService.signIn).not.toHaveBeenCalled();
    });
  });

  it('should show alert for authentication error', async () => {
    (AuthService.signIn as jest.Mock).mockResolvedValue(
      failure(new AuthenticationError('Credenziali non valide'))
    );

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Errore Login',
        'Credenziali non valide'
      );
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  it('should handle Google OAuth login', async () => {
    (AuthService.signInWithOAuth as jest.Mock).mockResolvedValue(success(undefined));

    render(<LoginScreen />);

    const googleButton = screen.getByText('Continua con Google');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(AuthService.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
      });
    });
  });

  it('should handle Apple OAuth login', async () => {
    (AuthService.signInWithOAuth as jest.Mock).mockResolvedValue(success(undefined));

    render(<LoginScreen />);

    const appleButton = screen.getByText('Continua con Apple');
    fireEvent.press(appleButton);

    await waitFor(() => {
      expect(AuthService.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
      });
    });
  });

  it('should show alert for OAuth error', async () => {
    (AuthService.signInWithOAuth as jest.Mock).mockResolvedValue(
      failure(new ValidationError('Provider non configurato'))
    );

    render(<LoginScreen />);

    const googleButton = screen.getByText('Continua con Google');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Provider non configurato');
    });
  });

  it('should disable inputs during loading', async () => {
    (AuthService.signIn as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(success(mockSession)), 1000))
    );

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // During loading
    await waitFor(() => {
      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
    });
  });

  it('should clear validation errors on new submit attempt', async () => {
    (AuthService.signIn as jest.Mock).mockResolvedValue(success(mockSession));

    render(<LoginScreen />);

    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Accedi');

    // First attempt with invalid email
    fireEvent.changeText(emailInput, 'invalid');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Email non valida')).toBeTruthy();
    });

    // Second attempt with valid email - errors should be cleared
    fireEvent.changeText(emailInput, 'valid@example.com');
    fireEvent.press(loginButton);

    // After valid submit, AuthService should be called and error should not persist
    await waitFor(() => {
      expect(AuthService.signIn).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'password123',
      });
    });
  });
});
