/**
 * Sentry Configuration
 *
 * Configurazione centralizzata per error tracking e monitoring
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Configurazione Sentry
export const initSentry = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  // Non inizializzare Sentry in development se DSN non configurato
  if (!dsn && __DEV__) {
    // eslint-disable-next-line no-console
    console.log('Sentry DSN non configurato - monitoring disabilitato in development');
    return;
  }

  Sentry.init({
    dsn,

    // Environment
    environment: __DEV__ ? 'development' : 'production',

    // Release tracking
    release: `primariga@${Constants.expoConfig?.version || '1.0.0'}`,
    dist: String(
      Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber || 1
    ),

    // Performance monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in production
    tracePropagationTargets: ['localhost', /^\//],

    // Profiling
    profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in production

    // Session tracking
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds

    // Native crashes
    enableNative: true,
    enableNativeCrashHandling: true,

    // Debug
    debug: __DEV__,

    // Integrations
    integrations: [
      // React Navigation integration
      Sentry.reactNavigationIntegration(),
    ],

    // Before send hook - sanitizza dati sensibili
    beforeSend(event, hint) {
      // Rimuovi dati sensibili
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }

      // Log in development
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Sentry Event:', event);
        // eslint-disable-next-line no-console
        console.log('Sentry Hint:', hint);
      }

      return event;
    },

    // Before breadcrumb - filtra breadcrumbs
    beforeBreadcrumb(breadcrumb, _hint) {
      // Filtra breadcrumbs console.log in production
      if (!__DEV__ && breadcrumb.category === 'console') {
        return null;
      }

      return breadcrumb;
    },

    // Ignore errors comuni non actionable
    ignoreErrors: [
      // Network errors
      'Network request failed',
      'Failed to fetch',

      // Canceled requests
      'AbortError',
      'Request aborted',

      // React Native
      'Trying to initialize',
      'Invariant Violation',
    ],
  });

  // Set user context (verrà aggiornato dopo login)
  Sentry.setUser({ id: 'anonymous' });

  // Set tags
  Sentry.setTag('platform', Constants.platform?.os || 'unknown');
  Sentry.setTag('app_version', Constants.expoConfig?.version || 'unknown');

  // eslint-disable-next-line no-console
  console.log('✅ Sentry initialized');
};

/**
 * Set user context dopo login
 */
export const setSentryUser = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context dopo logout
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb manuale
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception manualmente
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureMessage(message, level);
  });
};

/**
 * Set custom context
 */
export const setContext = (key: string, value: Record<string, unknown>) => {
  Sentry.setContext(key, value);
};

/**
 * Set tag
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Start span per performance monitoring
 * 
 * @example
 * const span = startSpan('fetchData');
 * try {
 *   await fetchData();
 * } finally {
 *   span.end();
 * }
 */
export const startSpan = (name: string, op: string = 'function') => {
  return Sentry.startSpan(
    {
      name,
      op,
    },
    (span) => span
  );
};

export default Sentry;
