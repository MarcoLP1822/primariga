/**
 * Monitoring Module Exports
 *
 * Esportazioni centralizzate per Sentry e monitoring utilities
 */

// Main Sentry functions
export {
  initSentry,
  setSentryUser,
  clearSentryUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  setContext,
  setTag,
  startSpan,
} from './sentry';

// Breadcrumbs helpers
export {
  trackNavigation,
  trackAction,
  trackApiCall,
  trackBookInteraction,
  trackReadingSession,
  trackErrorRecovery,
  trackPerformanceIssue,
} from './breadcrumbs';

// Default export
export { default as Sentry } from './sentry';
