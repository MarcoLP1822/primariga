import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Button } from './Button';
import { spacing } from '../theme/spacing';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

/**
 * ErrorMessage Component
 * Messaggio di errore con pulsante retry
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, style }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.error }]}>
        {message}
      </Text>
      {onRetry && (
        <Button mode="outlined" onPress={onRetry} style={styles.button}>
          Riprova
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    minWidth: 120,
  },
});
