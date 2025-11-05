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

/**
 * Root Layout - Configura providers globali e navigazione
 */
export default function RootLayout() {
  // Inizializza Sentry all'avvio
  useEffect(() => {
    initSentry();
  }, []);

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
