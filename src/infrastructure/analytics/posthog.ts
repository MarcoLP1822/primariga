/**
 * PostHog Analytics Configuration
 * 
 * Centralized configuration for PostHog analytics platform
 */

import PostHog from 'posthog-react-native';

let posthogInstance: PostHog | null = null;

/**
 * Initialize PostHog analytics
 * 
 * Should be called once at app startup
 */
export const initPostHog = (): PostHog | null => {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  // Skip initialization if API key not configured (development/testing)
  if (!apiKey) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[PostHog] API key not configured - analytics disabled');
    }
    return null;
  }

  try {
    posthogInstance = new PostHog(apiKey, {
      host,
      
      // Auto-capture features
      captureAppLifecycleEvents: true, // app opened, backgrounded, foregrounded
      
      // Session replay (powerful feature for debugging)
      enableSessionReplay: false, // disabled by default for privacy
      
      // Performance
      flushAt: 20, // flush events after 20 are queued
      flushInterval: 30, // or after 30 seconds
      
      // Persistence
      persistence: 'file', // persist events between app restarts
    });

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[PostHog] Initialized successfully');
    }

    return posthogInstance;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[PostHog] Initialization failed:', error);
    return null;
  }
};

/**
 * Get the PostHog instance
 * 
 * Returns null if PostHog is not initialized
 */
export const getPostHog = (): PostHog | null => {
  return posthogInstance;
};

/**
 * Reset PostHog instance
 * 
 * Useful for testing or logout scenarios
 */
export const resetPostHog = (): void => {
  if (posthogInstance) {
    posthogInstance.reset();
  }
};
