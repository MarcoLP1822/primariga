/**
 * Error Handler Utilities
 *
 * Funzioni per gestire e loggare errori
 */

import { AppError, ValidationError, BusinessLogicError } from './AppError';
import { ZodError } from 'zod';
import * as Sentry from '../../infrastructure/monitoring/sentry';

/**
 * Normalize errors to AppError
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!fields[path]) fields[path] = [];
      fields[path].push(issue.message);
    });

    return new ValidationError('Errori di validazione', fields);
  }

  // Standard Error
  if (error instanceof Error) {
    return new BusinessLogicError(error.message);
  }

  // Unknown error type
  return new BusinessLogicError('Si è verificato un errore sconosciuto');
}

/**
 * Log error con integrazione Sentry
 */
export function logError(error: AppError, context?: Record<string, unknown>) {
  const errorData = {
    ...error.toJSON(),
    context,
    timestamp: new Date().toISOString(),
  };

  // Log to Sentry in production
  if (!__DEV__ && shouldReportError(error)) {
    Sentry.captureException(new Error(error.message), {
      error: errorData,
      errorCode: error.code,
      errorType: error.constructor.name,
      ...context,
    });
  }

  // Log to console in development
  if (__DEV__) {
    console.error('Error logged:', errorData);
  }

  // Always log to console.error
  console.error(`[${error.code}] ${error.message}`, error);
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(error: AppError): string {
  // Custom messages per error type
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Problemi di connessione. Verifica la tua connessione internet.';
    case 'DATABASE_ERROR':
      return 'Problema tecnico temporaneo. Riprova tra qualche istante.';
    case 'NOT_FOUND':
      return error.message; // Already user-friendly
    case 'VALIDATION_ERROR':
      return 'Alcuni dati inseriti non sono validi. Controlla e riprova.';
    case 'AUTHENTICATION_ERROR':
      return 'Devi effettuare il login per continuare.';
    case 'AUTHORIZATION_ERROR':
      return 'Non hai i permessi per questa operazione.';
    case 'RATE_LIMIT_ERROR':
      return 'Troppe richieste. Attendi qualche secondo e riprova.';
    default:
      return error.message || 'Si è verificato un errore. Riprova più tardi.';
  }
}

/**
 * Check if error should be reported to monitoring
 */
export function shouldReportError(error: AppError): boolean {
  // Don't report client errors (4xx) to monitoring
  if (error.statusCode >= 400 && error.statusCode < 500) {
    // Except authentication/authorization issues
    return error.code === 'AUTHENTICATION_ERROR' || error.code === 'AUTHORIZATION_ERROR';
  }

  // Report all server errors (5xx)
  return error.statusCode >= 500;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      code: error.code,
      message: getUserMessage(error),
      statusCode: error.statusCode,
      ...(error.metadata && { details: error.metadata }),
    },
  };
}

/**
 * Handle async errors with Result pattern
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const appError = normalizeError(error);
    logError(appError);
    return { error: appError };
  }
}
