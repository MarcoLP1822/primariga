/**
 * Custom Error Classes
 *
 * Gerarchia di errori type-safe per l'applicazione
 */

/**
 * Base AppError
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      metadata: this.metadata,
    };
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(
    message: string = 'Dati non validi',
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, { fields });
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, id?: string) {
    const message = id ? `${resource} con ID ${id} non trovato` : `${resource} non trovato`;
    super(message, { resource, id });
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;

  constructor(message: string = 'Autenticazione richiesta') {
    super(message);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
  readonly code = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403;

  constructor(message: string = 'Permessi insufficienti') {
    super(message);
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;

  constructor(
    message: string = 'Errore database',
    public readonly originalError?: Error
  ) {
    super(message, { originalError: originalError?.message });
  }
}

/**
 * Network Error (503)
 */
export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR';
  readonly statusCode = 503;

  constructor(
    message: string = 'Errore di connessione',
    public readonly url?: string
  ) {
    super(message, { url });
  }
}

/**
 * Business Logic Error (422)
 */
export class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR';
  readonly statusCode = 422;

  constructor(message: string) {
    super(message);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;

  constructor(
    message: string = 'Troppe richieste, riprova più tardi',
    public readonly retryAfter?: number
  ) {
    super(message, { retryAfter });
  }
}

/**
 * Configuration Error (500)
 */
export class ConfigurationError extends AppError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly statusCode = 500;

  constructor(
    message: string,
    public readonly configKey?: string
  ) {
    super(message, { configKey });
  }
}

/**
 * External Service Error (502)
 */
export class ExternalServiceError extends AppError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;

  constructor(serviceName: string, message?: string) {
    super(message || `Errore servizio esterno: ${serviceName}`, { serviceName });
  }
}

/**
 * Type guards
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Error factory helper
 */
export function createError(
  type: 'validation' | 'notFound' | 'auth' | 'database' | 'network' | 'business',
  message: string,
  metadata?: Record<string, unknown>
): AppError {
  switch (type) {
    case 'validation':
      return new ValidationError(message, metadata?.fields as Record<string, string[]> | undefined);
    case 'notFound':
      return new NotFoundError(metadata?.resource as string || 'Resource', metadata?.id as string);
    case 'auth':
      return new AuthenticationError(message);
    case 'database':
      return new DatabaseError(message, metadata?.originalError as Error);
    case 'network':
      return new NetworkError(message, metadata?.url as string);
    case 'business':
      return new BusinessLogicError(message);
    default:
      return new BusinessLogicError(message);
  }
}
