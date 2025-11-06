/**
 * Analytics Events
 * 
 * Centralized enum for all analytics events tracked in the app
 */

export enum AnalyticsEvent {
  // ===== App Lifecycle =====
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  APP_FOREGROUNDED = 'app_foregrounded',

  // ===== Screen Views =====
  SCREEN_VIEWED = 'screen_viewed',

  // ===== Book Interactions =====
  BOOK_CARD_VIEWED = 'book_card_viewed', // impression tracking
  BOOK_DETAIL_OPENED = 'book_detail_opened',
  BOOK_LIKED = 'book_liked',
  BOOK_UNLIKED = 'book_unliked',
  BOOK_SHARED = 'book_shared',
  PURCHASE_LINK_CLICKED = 'purchase_link_clicked',

  // ===== User Authentication =====
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  LOGIN_STARTED = 'login_started',
  LOGIN_COMPLETED = 'login_completed',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',

  // ===== Search & Discovery =====
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',
  GENRE_SELECTED = 'genre_selected',

  // ===== Errors =====
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

/**
 * Analytics Properties
 * 
 * Type-safe properties for analytics events
 */
export interface AnalyticsProperties {
  // Screen properties
  screen_name?: string;
  previous_screen?: string;

  // Book properties
  book_id?: string;
  book_title?: string;
  book_author?: string;
  book_genres?: string[];
  book_language?: string;

  // User properties
  user_id?: string;
  is_authenticated?: boolean;
  auth_method?: 'email' | 'google' | 'apple';

  // Search properties
  search_query?: string;
  search_results_count?: number;
  filter_type?: string;
  filter_value?: string;

  // Error properties
  error_message?: string;
  error_type?: string;
  error_screen?: string;

  // Generic properties
  source?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
