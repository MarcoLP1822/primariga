import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard, useTheme } from 'react-native-paper';
import { shadows } from '../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

/**
 * Card Component
 * Card riutilizzabile con elevazione personalizzabile
 */
export const Card: React.FC<CardProps> = ({ children, onPress, elevation = 'md', style }) => {
  const theme = useTheme();

  const Component = onPress ? PaperCard : PaperCard;

  return (
    <Component
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          ...shadows[elevation],
        },
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
