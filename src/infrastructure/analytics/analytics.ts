/**
 * Analytics Service
 * 
 * Centralized analytics tracking service for the entire app.
 * Wraps PostHog and provides type-safe event tracking.
 */

import { getPostHog, resetPostHog } from './posthog';
import { AnalyticsEvent, AnalyticsProperties } from './events';

/**
 * Analytics Service
 * 
 * Provides methods for tracking events, identifying users, and managing analytics state
 */
export const analytics = {
  /**
   * Track an analytics event
   * 
   * @param event - The event name from AnalyticsEvent enum
   * @param properties - Optional properties to attach to the event
   * 
   * @example
   * ```ts
   * analytics.track(AnalyticsEvent.BOOK_LIKED, {
   *   book_id: '123',
   *   book_title: 'The Great Gatsby',
   *   screen: 'Home'
   * });
   * ```
   */
  track: (event: AnalyticsEvent, properties?: AnalyticsProperties): void => {
    const posthog = getPostHog();
    if (!posthog) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[Analytics] Track: ${event}`, properties);
      }
      return;
    }

    try {
      posthog.capture(event, properties);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Track error:', error);
    }
  },

  /**
   * Identify a user
   * 
   * Associates all future events with the user ID and optional traits
   * 
   * @param userId - The unique user ID
   * @param traits - Optional user properties/traits
   * 
   * @example
   * ```ts
   * analytics.identify('user-123', {
   *   email: 'user@example.com',
   *   plan: 'free',
   *   signup_date: '2024-01-01'
   * });
   * ```
   */
  identify: (userId: string, traits?: AnalyticsProperties): void => {
    const posthog = getPostHog();
    if (!posthog) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[Analytics] Identify: ${userId}`, traits);
      }
      return;
    }

    try {
      posthog.identify(userId, traits);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Identify error:', error);
    }
  },

  /**
   * Track a screen view
   * 
   * Automatically tracks when a user views a screen
   * 
   * @param screenName - The name of the screen
   * @param properties - Optional properties about the screen view
   * 
   * @example
   * ```ts
   * analytics.screen('Book Detail', {
   *   book_id: '123',
   *   source: 'Home'
   * });
   * ```
   */
  screen: (screenName: string, properties?: AnalyticsProperties): void => {
    const posthog = getPostHog();
    if (!posthog) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[Analytics] Screen: ${screenName}`, properties);
      }
      return;
    }

    try {
      posthog.screen(screenName, properties);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Screen error:', error);
    }
  },

  /**
   * Register super properties
   * 
   * Properties that will be sent with every event
   * 
   * @param properties - Properties to register
   * 
   * @example
   * ```ts
   * analytics.register({
   *   app_version: '1.0.0',
   *   environment: 'production'
   * });
   * ```
   */
  register: async (properties: AnalyticsProperties): Promise<void> => {
    const posthog = getPostHog();
    if (!posthog) {
      return;
    }

    try {
      await posthog.register(properties);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Register error:', error);
    }
  },

  /**
   * Reset analytics state
   * 
   * Call this when a user logs out to clear their identity
   * and all super properties
   * 
   * @example
   * ```ts
   * // On logout
   * analytics.reset();
   * ```
   */
  reset: (): void => {
    try {
      resetPostHog();
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[Analytics] Reset');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Reset error:', error);
    }
  },

  /**
   * Manually flush the event queue
   * 
   * Forces all queued events to be sent immediately
   * 
   * @example
   * ```ts
   * // Before app closes or critical action
   * await analytics.flush();
   * ```
   */
  flush: async (): Promise<void> => {
    const posthog = getPostHog();
    if (!posthog) {
      return;
    }

    try {
      await posthog.flush();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Analytics] Flush error:', error);
    }
  },
};
