import { supabase } from '../../data/supabaseClient';
import { success, failure } from '../../core/errors/Result';
import type { Result } from '../../core/errors/Result';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  ExternalServiceError,
  BusinessLogicError,
} from '../../core/errors/AppError';
import { Session, User, AuthError as SupabaseAuthError, AuthChangeEvent } from '@supabase/supabase-js';

/**
 * Authentication Service
 * 
 * Gestisce tutte le operazioni di autenticazione tramite Supabase Auth.
 * Utilizza Result pattern per error handling consistente.
 * 
 * Features:
 * - Email/Password signup & login
 * - OAuth providers (Google, Apple)
 * - Session management (auto-refresh, persistence)
 * - Password reset
 * - Email verification
 */

// =====================================================
// TYPES
// =====================================================

export interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
  username?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface OAuthProvider {
  provider: 'google' | 'apple' | 'github' | 'facebook';
  redirectTo?: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  newPassword: string;
}

export interface AuthStateChangeCallback {
  (event: AuthChangeEvent, session: Session | null): void;
}

// =====================================================
// ERROR HELPERS
// =====================================================

/**
 * Converte errori Supabase Auth in AppError tipizzati
 */
const mapAuthError = (error: SupabaseAuthError | null): AppError => {
  if (!error) {
    return new BusinessLogicError('Unknown authentication error');
  }

  const message = error.message || 'Authentication failed';
  const status = error.status;

  // Map common Supabase auth errors to appropriate AppError types
  if (message.includes('Invalid login credentials')) {
    return new AuthenticationError('Email o password non validi');
  }

  if (message.includes('Email not confirmed')) {
    return new AuthenticationError('Email non verificata. Controlla la tua casella di posta.');
  }

  if (message.includes('User already registered')) {
    return new ValidationError('Un account con questa email esiste già');
  }

  if (message.includes('Password should be at least')) {
    return new ValidationError('La password deve contenere almeno 6 caratteri');
  }

  if (status === 429) {
    return new RateLimitError('Troppi tentativi. Riprova tra qualche minuto.');
  }

  if (status && status >= 500) {
    return new ExternalServiceError('Supabase Auth', 'Servizio di autenticazione temporaneamente non disponibile');
  }

  // Default to authentication error
  return new AuthenticationError(message);
};

// =====================================================
// AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Registra un nuovo utente con email e password
 * 
 * Il trigger del database creerà automaticamente un record in public.profiles
 * 
 * @returns User object se successo
 */
export const signUp = async (params: SignUpParams): Promise<Result<User, AppError>> => {
  try {
    const { email, password, fullName, username } = params;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`, // Per web
      },
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    if (!data.user) {
      return failure(new AuthenticationError('Registrazione fallita'));
    }

    return success(data.user);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante la registrazione'));
  }
};

/**
 * Effettua il login con email e password
 * 
 * @returns Session object se successo
 */
export const signIn = async (params: SignInParams): Promise<Result<Session, AppError>> => {
  try {
    const { email, password } = params;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    if (!data.session) {
      return failure(new AuthenticationError('Login fallito'));
    }

    return success(data.session);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante il login'));
  }
};

/**
 * Effettua il login tramite OAuth provider (Google, Apple, etc.)
 * 
 * Su mobile, usa deep linking per ritornare all'app
 * Su web, usa redirectTo URL
 */
export const signInWithOAuth = async (params: OAuthProvider): Promise<Result<void, AppError>> => {
  try {
    const { provider, redirectTo } = params;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false, // Per mobile, Expo gestisce il redirect
      },
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    return success(undefined);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante il login OAuth'));
  }
};

/**
 * Effettua il logout
 */
export const signOut = async (): Promise<Result<void, AppError>> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return failure(mapAuthError(error));
    }

    return success(undefined);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante il logout'));
  }
};

/**
 * Invia email per reset password
 */
export const resetPassword = async (params: ResetPasswordParams): Promise<Result<void, AppError>> => {
  try {
    const { email } = params;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    return success(undefined);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante il reset password'));
  }
};

/**
 * Aggiorna la password (dopo reset o da settings)
 */
export const updatePassword = async (params: UpdatePasswordParams): Promise<Result<void, AppError>> => {
  try {
    const { newPassword } = params;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    return success(undefined);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante l\'aggiornamento password'));
  }
};

/**
 * Ottiene la sessione corrente (null se non autenticato)
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null;
    }

    return data.session;
  } catch {
    return null;
  }
};

/**
 * Ottiene l'utente corrente (null se non autenticato)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
};

/**
 * Verifica se l'utente è autenticato
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

/**
 * Sottoscrivi ai cambiamenti dello stato di autenticazione
 * 
 * Utile per aggiornare l'UI quando l'utente fa login/logout
 * o quando la sessione viene refreshata automaticamente
 * 
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: AuthStateChangeCallback): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Rinfresca manualmente la sessione
 * 
 * Normalmente non necessario (autoRefreshToken è true),
 * ma utile per forzare un refresh in caso di problemi
 */
export const refreshSession = async (): Promise<Result<Session, AppError>> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      return failure(new AuthenticationError('Impossibile rinnovare la sessione'));
    }

    return success(data.session);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante il rinnovo sessione'));
  }
};

/**
 * Ri-invia email di verifica
 */
export const resendVerificationEmail = async (email: string): Promise<Result<void, AppError>> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return failure(mapAuthError(error));
    }

    return success(undefined);
  } catch (err) {
    return failure(new BusinessLogicError('Errore durante l\'invio email'));
  }
};

// =====================================================
// EXPORTS
// =====================================================

export const AuthService = {
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  resetPassword,
  updatePassword,
  getSession,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChange,
  refreshSession,
  resendVerificationEmail,
};
