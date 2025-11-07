/**
 * SessionManager - Gestione timeout e sicurezza sessioni
 * 
 * Implementa:
 * - Auto-logout dopo inattività (30 minuti default)
 * - Warning prima del timeout (5 minuti prima)
 * - Reset timeout su interazione utente
 * - Tracking background/foreground
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import { useAppStore } from '../store/store';
import { analytics, AnalyticsEvent } from '../analytics';

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes warning

/**
 * Hook per gestire il timeout della sessione
 * 
 * Features:
 * - Auto-logout dopo 30 minuti di inattività
 * - Warning 5 minuti prima del logout
 * - Reset automatico su interazione
 * - Pause quando app va in background
 * 
 * Usage:
 * ```tsx
 * function App() {
 *   const { resetTimeout } = useSessionTimeout();
 *   
 *   return (
 *     <GestureHandlerRootView onTouchStart={resetTimeout}>
 *       {children}
 *     </GestureHandlerRootView>
 *   );
 * }
 * ```
 */
export function useSessionTimeout() {
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningShownRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  
  const logout = useAppStore((state) => state.logout);
  const isAuthenticated = useAppStore((state) => !state.isAnonymous);

  /**
   * Gestisce la scadenza della sessione
   */
  const handleSessionExpired = useCallback(() => {
    Alert.alert(
      '🔒 Sessione Scaduta',
      'Per motivi di sicurezza, la tua sessione è scaduta dopo 30 minuti di inattività. Effettua nuovamente l\'accesso.',
      [
        {
          text: 'OK',
          onPress: () => {
            logout();
          },
        },
      ]
    );

    analytics.track(AnalyticsEvent.LOGOUT, {
      reason: 'session_timeout',
    });

    logout();
  }, [logout]);

  /**
   * Reset timeout timer - chiamato ad ogni interazione utente
   */
  const resetTimeout = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isAuthenticated && appStateRef.current === 'active') {
      timeoutRef.current = setTimeout(checkTimeout, 60000); // Check every minute
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Verifica lo stato del timeout
   */
  const checkTimeout = useCallback(() => {
    const timeSinceActivity = Date.now() - lastActivityRef.current;
    
    // Timeout raggiunto - logout forzato
    if (timeSinceActivity >= SESSION_TIMEOUT) {
      handleSessionExpired();
      return;
    }

    // Warning 5 minuti prima
    if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT && !warningShownRef.current) {
      showWarning();
      warningShownRef.current = true;
    }

    // Continua a controllare
    timeoutRef.current = setTimeout(checkTimeout, 60000);
  }, [handleSessionExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Mostra warning 5 minuti prima del timeout
   */
  const showWarning = useCallback(() => {
    Alert.alert(
      '⚠️ Sessione in Scadenza',
      'La tua sessione scadrà tra 5 minuti per motivi di sicurezza. Continua ad usare l\'app per rimanere connesso.',
      [
        {
          text: 'OK',
          onPress: () => {
            // User interaction resets timeout
            resetTimeout();
          },
        },
      ]
    );

    analytics.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_type: 'session_warning',
    });
  }, [resetTimeout]);

  /**
   * Gestisce il cambio di stato dell'app (background/foreground)
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;

      if (nextAppState === 'active') {
        // App tornata in foreground - verifica se è scaduta
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        
        if (timeSinceActivity >= SESSION_TIMEOUT) {
          handleSessionExpired();
        } else {
          // Riprendi il checking
          resetTimeout();
        }
      } else if (nextAppState === 'background') {
        // App in background - ferma il checking ma mantieni il timestamp
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    });

    resetTimeout();

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return { resetTimeout };
}

/**
 * Higher-order component per wrappare l'app con session management
 * Not recommended for React Native - use the hook directly instead
 */
