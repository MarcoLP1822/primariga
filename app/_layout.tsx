import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { lightTheme } from '../src/presentation/theme';
import { queryClient } from '../src/infrastructure/config/queryClient';
import { initSentry } from '../src/infrastructure/monitoring/sentry';
import { initPostHog } from '../src/infrastructure/analytics';
import { ErrorBoundary } from '../src/presentation/components/ErrorBoundary';
import { useAppStore } from '../src/infrastructure/store/store';
import { AuthService } from '../src/infrastructure/auth';

/**
 * Root Layout - Configura providers globali e navigazione
 * 
 * IMPORTANT: L'app supporta utilizzo anonimo.
 * L'auth viene inizializzata ma NON forza il login.
 * Gli utenti possono browse senza account e fare login solo quando necessario (es. per salvare preferiti).
 */
export default function RootLayout() {
  const initialize = useAppStore((state) => state.initialize);
  const setSession = useAppStore((state) => state.setSession);

  // Inizializza Sentry, PostHog e Auth all'avvio
  useEffect(() => {
    // Initialize Sentry
    initSentry();
    
    // Initialize PostHog Analytics
    initPostHog();
    
    // Initialize auth state (check for existing session)
    // Se esiste sessione, la recupera; altrimenti l'utente rimane anonimo
    initialize();

    // Subscribe to auth state changes
    const unsubscribe = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User logged in - update store with session
        await setSession(session);
      } else if (event === 'SIGNED_OUT') {
        // User logged out - clear session (user becomes anonymous)
        await setSession(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Session refreshed - update store
        await setSession(session);
      }
      // Altri eventi (USER_UPDATED, PASSWORD_RECOVERY, etc.) possono essere gestiti qui
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [initialize, setSession]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider theme={lightTheme}>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: lightTheme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Auth Stack - No header */}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              
              {/* Main App Stack */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              
              {/* Book Detail Modal */}
              <Stack.Screen
                name="book/[id]"
                options={{
                  title: 'Dettagli Libro',
                  presentation: 'modal',
                }}
              />
            </Stack>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
