import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AppError, normalizeError, logError } from '../../core/errors';

interface Props {
  children: ReactNode;
  fallback?: (error: AppError, reset: () => void) => ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
}

interface State {
  error: AppError | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Cattura errori React e mostra UI fallback
 *
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const appError = normalizeError(error);
    return { error: appError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = normalizeError(error);

    // Log error
    logError(appError, {
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary',
    });

    // Call custom error handler
    this.props.onError?.(appError, errorInfo);

    this.setState({ errorInfo });
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      // Custom fallback UI
      if (fallback) {
        return fallback(error, this.reset);
      }

      // Default fallback UI
      return <DefaultErrorFallback error={error} onReset={this.reset} />;
    }

    return children;
  }
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({ error, onReset }: { error: AppError; onReset: () => void }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Ops! Qualcosa è andato storto
      </Text>

      <Text variant="bodyLarge" style={styles.message}>
        {error.message}
      </Text>

      {__DEV__ && (
        <View style={styles.devInfo}>
          <Text variant="labelSmall" style={styles.errorCode}>
            Codice errore: {error.code}
          </Text>
          {error.metadata && (
            <Text variant="labelSmall" style={styles.metadata}>
              {JSON.stringify(error.metadata, null, 2)}
            </Text>
          )}
        </View>
      )}

      <Button mode="contained" onPress={onReset} style={styles.button}>
        Riprova
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginTop: 16,
  },
  devInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  errorCode: {
    fontFamily: 'monospace',
    color: '#e91e63',
    marginBottom: 8,
  },
  metadata: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#666',
  },
});
