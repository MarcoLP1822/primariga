/**
 * Sentry Breadcrumbs Helper
 *
 * Helper functions per tracciare azioni utente e eventi importanti
 */

import { addBreadcrumb, setContext, setTag } from './sentry';

/**
 * Track navigation - quando l'utente naviga tra schermate
 */
export const trackNavigation = (screenName: string, params?: Record<string, unknown>) => {
  addBreadcrumb(`Navigate to ${screenName}`, 'navigation', 'info', params);
};

/**
 * Track user action - quando l'utente compie un'azione significativa
 */
export const trackAction = (action: string, details?: Record<string, unknown>) => {
  addBreadcrumb(action, 'user-action', 'info', details);
};

/**
 * Track API call - quando viene fatta una chiamata API
 */
export const trackApiCall = (
  endpoint: string,
  method: string,
  status?: number,
  duration?: number
) => {
  addBreadcrumb(`API ${method} ${endpoint}`, 'http', status && status >= 400 ? 'error' : 'info', {
    endpoint,
    method,
    status,
    duration,
  });
};

/**
 * Track book interaction - quando l'utente interagisce con un libro
 */
export const trackBookInteraction = (
  action: 'view' | 'like' | 'unlike' | 'read',
  bookId: string
) => {
  addBreadcrumb(`Book ${action}`, 'user-action', 'info', { bookId, action });
  setContext('last_book_interaction', { bookId, action, timestamp: new Date().toISOString() });
};

/**
 * Track reading session - inizio/fine sessione di lettura
 */
export const trackReadingSession = (action: 'start' | 'end', duration?: number) => {
  addBreadcrumb(`Reading session ${action}`, 'user-action', 'info', {
    action,
    duration,
  });

  if (action === 'end' && duration) {
    setTag('last_session_duration', String(duration));
  }
};

/**
 * Track error recovery - quando l'utente si riprende da un errore
 */
export const trackErrorRecovery = (errorType: string, recoveryAction: string) => {
  addBreadcrumb(`Recovered from ${errorType}`, 'error-recovery', 'info', {
    errorType,
    recoveryAction,
  });
};

/**
 * Track performance issue - quando viene rilevato un problema di performance
 */
export const trackPerformanceIssue = (issue: string, details?: Record<string, unknown>) => {
  addBreadcrumb(`Performance: ${issue}`, 'performance', 'warning', details);
};
