import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { lightTheme } from '../src/presentation/theme';
import { queryClient } from '../src/infrastructure/config/queryClient';
import { initSentry } from '../src/infrastructure/monitoring/sentry';
import { ErrorBoundary } from '../src/presentation/components/ErrorBoundary';
import { useAppStore } from '../src/infrastructure/store/store';

/**
 * Genera un UUID v4 valido
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Root Layout - Configura providers globali e navigazione
 */
export default function RootLayout() {
  const userId = useAppStore((state) => state.userId);
  const setUser = useAppStore((state) => state.setUser);

  // Inizializza Sentry e userId all'avvio
  useEffect(() => {
    initSentry();
    
    // Genera un ID utente se non esiste (per MVP, in futuro con auth Supabase)
    if (!userId) {
      const tempUserId = generateUUID();
      setUser(tempUserId);
    }
  }, [userId, setUser]);

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
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
