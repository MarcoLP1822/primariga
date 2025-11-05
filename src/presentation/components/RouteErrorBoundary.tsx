import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AppError } from '../../core/errors';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

interface Props {
  children: ReactNode;
  onError?: (error: AppError) => void;
}

/**
 * Route Error Boundary
 *
 * Error boundary specifico per route/screen
 * Permette all'app di continuare a funzionare anche se una route crasha
 */
export function RouteErrorBoundary({ children, onError }: Props) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Route error:', error);
        onError?.(error);
      }}
      fallback={(error, reset) => (
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            Errore nella pagina
          </Text>
          <Text variant="bodyLarge" style={styles.message}>
            {error.message}
          </Text>
          <Button mode="contained" onPress={reset} style={styles.button}>
            Riprova
          </Button>
        </View>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});
