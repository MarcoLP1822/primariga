import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  style?: ViewStyle;
}

/**
 * LoadingSpinner Component
 * Spinner di caricamento centralizzato
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
