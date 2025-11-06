import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/data/supabaseClient';
import { lightTheme } from './src/presentation/theme';
import { Card, LoadingSpinner, ErrorMessage } from './src/presentation/components';
import { spacing } from './src/presentation/theme/spacing';
import { initSentry } from './src/infrastructure/monitoring/sentry';
import { initPostHog } from './src/infrastructure/analytics';

// Inizializza Sentry all'avvio
initSentry();

// Inizializza PostHog all'avvio
initPostHog();

export default function App() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [booksCount, setBooksCount] = useState<number>(0);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test connessione al database
      const { error, count } = await supabase
        .from('books')
        .select('id', { count: 'exact', head: false });

      if (error) throw error;

      setConnected(true);
      setBooksCount(count ?? 0);
    } catch (error) {
      console.error('Errore connessione Supabase:', error);
      setConnected(false);
    }
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <View style={styles.container}>
          <StatusBar style="auto" />

          <Text variant="displaySmall" style={styles.title}>
            Primariga
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Scopri nuove letture alla cieca
          </Text>

          <Card style={styles.statusCard} elevation="md">
            {connected === null && <LoadingSpinner size="small" />}
            {connected === true && (
              <>
                <Text variant="titleLarge" style={styles.successText}>
                  ✅ Connesso a Supabase!
                </Text>
                <Text variant="bodyLarge" style={styles.booksCount}>
                  📚 Libri nel database: {booksCount}
                </Text>
              </>
            )}
            {connected === false && (
              <ErrorMessage message="❌ Errore di connessione" onRetry={testConnection} />
            )}
          </Card>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#666',
  },
  statusCard: {
    width: '100%',
    maxWidth: 500,
    padding: spacing.lg,
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  booksCount: {
    textAlign: 'center',
  },
});
