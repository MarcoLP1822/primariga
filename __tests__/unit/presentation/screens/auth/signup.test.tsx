import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignupScreen from '../../../../../app/(auth)/signup';
import { AuthService } from '../../../../../src/infrastructure/auth';
import { router } from 'expo-router';
import { success, failure } from '../../../../../src/core/errors/Result';
import { ValidationError } from '../../../../../src/core/errors/AppError';
import type { User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('../../../../../src/infrastructure/auth');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
  Link: ({ children }: any) => children,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SignupScreen', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render signup form correctly', () => {
    render(<SignupScreen />);

    // Verifica il titolo del pattern "optional auth"
    expect(screen.getByText('Accedi per salvare i tuoi preferiti')).toBeTruthy();
    expect(screen.getByPlaceholderText('Mario Rossi')).toBeTruthy();
    expect(screen.getByPlaceholderText('mario_rossi')).toBeTruthy();
    expect(screen.getByPlaceholderText('tua@email.com')).toBeTruthy();
    expect(screen.getByText('Registrati')).toBeTruthy();
  });

  it('should successfully signup with valid data', async () => {
    (AuthService.signUp as jest.Mock).mockResolvedValue(success(mockUser));

    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(AuthService.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'Test User',
        username: 'testuser',
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        '✅ Registrazione Completata!',
        'Il tuo account è stato creato con successo. Puoi ora effettuare il login.',
        expect.any(Array)
      );
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Email non valida')).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for weak password', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent.press(signupButton);

    await waitFor(() => {
      // Should show at least one password requirement error
      const errors = screen.queryAllByText(/Password deve contenere/);
      expect(errors.length).toBeGreaterThan(0);
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for password without uppercase', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Password deve contenere almeno una maiuscola')).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for password without number', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Password deve contenere almeno un numero')).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for short full name', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'A');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Nome deve contenere almeno 2 caratteri')).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for short username', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'ab');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(screen.getByText('Username deve contenere almeno 3 caratteri')).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show validation error for invalid username characters', async () => {
    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'invalid@user');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(
        screen.getByText('Username può contenere solo lettere, numeri e underscore')
      ).toBeTruthy();
      expect(AuthService.signUp).not.toHaveBeenCalled();
    });
  });

  it('should show alert for existing user error', async () => {
    (AuthService.signUp as jest.Mock).mockResolvedValue(
      failure(new ValidationError('Un account con questa email esiste già'))
    );

    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'existing@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Errore Registrazione',
        'Un account con questa email esiste già'
      );
    });
  });

  it('should handle Google OAuth signup', async () => {
    (AuthService.signInWithOAuth as jest.Mock).mockResolvedValue(success(undefined));

    render(<SignupScreen />);

    const googleButton = screen.getByText('Continua con Google');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(AuthService.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
      });
    });
  });

  it('should handle Apple OAuth signup', async () => {
    (AuthService.signInWithOAuth as jest.Mock).mockResolvedValue(success(undefined));

    render(<SignupScreen />);

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

    render(<SignupScreen />);

    const googleButton = screen.getByText('Continua con Google');
    fireEvent.press(googleButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Errore', 'Provider non configurato');
    });
  });

  it('should disable inputs during loading', async () => {
    (AuthService.signUp as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(success(mockUser)), 1000))
    );

    render(<SignupScreen />);

    const fullNameInput = screen.getByPlaceholderText('Mario Rossi');
    const usernameInput = screen.getByPlaceholderText('mario_rossi');
    const emailInput = screen.getByPlaceholderText('tua@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signupButton = screen.getByText('Registrati');

    fireEvent.changeText(fullNameInput, 'Test User');
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(signupButton);

    // During loading
    await waitFor(() => {
      expect(fullNameInput.props.editable).toBe(false);
      expect(usernameInput.props.editable).toBe(false);
      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
    });
  });
});
