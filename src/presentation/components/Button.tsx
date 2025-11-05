import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';

export interface ButtonProps {
  children: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

/**
 * Button Component
 * Pulsante stilizzato con varianti
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  mode = 'contained',
  icon,
  loading,
  disabled,
  fullWidth,
  style,
}) => {
  const theme = useTheme();

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled}
      style={[styles.button, fullWidth && styles.fullWidth, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});
