import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing } from '../theme/spacing';

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
}

/**
 * EmptyState Component
 * Stato vuoto universale per liste/schermate vuote
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  emoji, 
  title, 
  description,
  style 
}) => {
  return (
    <View style={[styles.container, style]}>
      {emoji && (
        <Text variant="displayMedium" style={styles.emoji}>
          {emoji}
        </Text>
      )}
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 64,
    lineHeight: 80,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
