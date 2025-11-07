/**
 * Gestione sicura degli errori di autenticazione
 * Previene user enumeration e info disclosure
 */

import { analytics, AnalyticsEvent } from '../analytics';

/**
 * Messaggi di errore generici e sicuri per gli utenti
 */
export const AUTH_ERROR_MESSAGES = {
  LOGIN_FAILED: 'Email o password non corretti. Riprova.',
  SIGNUP_FAILED: 'Impossibile creare l\'account. Verifica i dati inseriti.',
  EMAIL_IN_USE: 'Impossibile completare la registrazione. Riprova con dati diversi.',
  NETWORK_ERROR: 'Errore di connessione. Verifica la tua rete.',
  RATE_LIMITED: 'Troppi tentativi. Riprova più tardi.',
  GENERIC_ERROR: 'Si è verificato un errore. Riprova più tardi.',
  WEAK_PASSWORD: 'La password non soddisfa i requisiti di sicurezza.',
  OAUTH_ERROR: 'Impossibile completare l\'autenticazione. Riprova.',
} as const;

/**
 * Mapping degli errori Supabase ai messaggi generici
 */
const SUPABASE_ERROR_MAPPINGS: Record<string, string> = {
  // Login errors
  'Invalid login credentials': AUTH_ERROR_MESSAGES.LOGIN_FAILED,
  'Invalid email or password': AUTH_ERROR_MESSAGES.LOGIN_FAILED,
  'Email not confirmed': AUTH_ERROR_MESSAGES.LOGIN_FAILED,
  
  // Signup errors  
  'User already registered': AUTH_ERROR_MESSAGES.EMAIL_IN_USE,
  'Email already registered': AUTH_ERROR_MESSAGES.EMAIL_IN_USE,
  'Email already exists': AUTH_ERROR_MESSAGES.EMAIL_IN_USE,
  
  // Password errors
  'Password should be at least': AUTH_ERROR_MESSAGES.WEAK_PASSWORD,
  'Password is too weak': AUTH_ERROR_MESSAGES.WEAK_PASSWORD,
  
  // Network errors
  'Failed to fetch': AUTH_ERROR_MESSAGES.NETWORK_ERROR,
  'Network request failed': AUTH_ERROR_MESSAGES.NETWORK_ERROR,
  'NetworkError': AUTH_ERROR_MESSAGES.NETWORK_ERROR,
  
  // Rate limiting
  'Too many requests': AUTH_ERROR_MESSAGES.RATE_LIMITED,
  'Rate limit exceeded': AUTH_ERROR_MESSAGES.RATE_LIMITED,
  
  // OAuth errors
  'OAuth error': AUTH_ERROR_MESSAGES.OAUTH_ERROR,
  'Provider error': AUTH_ERROR_MESSAGES.OAUTH_ERROR,
};

/**
 * Sanitizza un errore di autenticazione convertendolo in un messaggio generico sicuro
 * 
 * Previene:
 * - User enumeration (non rivela se un'email esiste)
 * - Info disclosure (non espone dettagli interni)
 * - Security details leakage
 * 
 * @param error - L'errore da sanitizzare
 * @param context - Contesto aggiuntivo per analytics (login/signup)
 * @returns Messaggio sicuro da mostrare all'utente
 */
export function sanitizeAuthError(error: Error, context: 'login' | 'signup' = 'login'): string {
  const errorMessage = error.message || '';
  
  // Log dettagliato per debugging (solo in console/analytics, mai mostrato all'utente)
  console.error('[Auth Error]', {
    context,
    errorName: error.name,
    errorMessage: errorMessage,
    timestamp: new Date().toISOString(),
  });
  
  // Track in analytics (senza PII)
  if (context === 'login') {
    analytics.track(AnalyticsEvent.LOGIN_FAILED, {
      auth_method: 'email',
      error_type: error.name || 'Unknown',
    });
  } else {
    analytics.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_type: 'signup_error',
      error_message: error.name || 'Unknown',
    });
  }
  
  // Cerca corrispondenze nel mapping
  for (const [pattern, genericMessage] of Object.entries(SUPABASE_ERROR_MAPPINGS)) {
    if (errorMessage.includes(pattern)) {
      return genericMessage;
    }
  }
  
  // Se non troviamo un match specifico, usa un messaggio generico basato sul contesto
  if (context === 'login') {
    return AUTH_ERROR_MESSAGES.LOGIN_FAILED;
  } else {
    return AUTH_ERROR_MESSAGES.SIGNUP_FAILED;
  }
}

/**
 * Sanitizza errori OAuth
 */
export function sanitizeOAuthError(error: Error): string {
  console.error('[OAuth Error]', {
    errorName: error.name,
    errorMessage: error.message,
    timestamp: new Date().toISOString(),
  });
  
  analytics.track(AnalyticsEvent.ERROR_OCCURRED, {
    error_type: 'oauth_error',
    error_message: error.name || 'Unknown',
  });
  
  return AUTH_ERROR_MESSAGES.OAUTH_ERROR;
}
