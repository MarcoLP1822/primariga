import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { IconButton as PaperIconButton } from 'react-native-paper';

export interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  mode?: 'outlined' | 'contained' | 'contained-tonal';
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * IconButton Component
 * Pulsante con icona universale per tutta l'app
 */
export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onPress, 
  size = 24,
  mode,
  disabled = false,
  style,
}) => {
  return (
    <PaperIconButton
      icon={icon}
      size={size}
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style]}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 0,
  },
});
