/**
 * useScreenTracking hook
 * 
 * Automatically tracks screen views when a component mounts
 */

import { useEffect } from 'react';
import { analytics, AnalyticsEvent, type AnalyticsProperties } from '../../infrastructure/analytics';

/**
 * Hook to automatically track screen views
 * 
 * @param screenName - Name of the screen to track
 * @param properties - Optional properties to include with the screen view
 * 
 * @example
 * ```tsx
 * function HomeScreen() {
 *   useScreenTracking('Home');
 *   // or with properties
 *   useScreenTracking('Book Detail', { book_id: '123' });
 *   
 *   return <View>...</View>;
 * }
 * ```
 */
export const useScreenTracking = (
  screenName: string,
  properties?: AnalyticsProperties
): void => {
  useEffect(() => {
    // Track screen view
    analytics.screen(screenName, {
      ...properties,
      screen_name: screenName,
    });

    // Also track as an event for easier funnel analysis
    analytics.track(AnalyticsEvent.SCREEN_VIEWED, {
      ...properties,
      screen_name: screenName,
    });
  }, [screenName, properties]);
};
