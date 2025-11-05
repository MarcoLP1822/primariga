import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar as PaperSnackbar } from 'react-native-paper';

export interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Snackbar Component
 * Notifiche toast universali per tutta l'app
 */
export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  onDismiss,
  duration = 3000,
  action,
}) => {
  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      action={action}
      style={styles.snackbar}
    >
      {message}
    </PaperSnackbar>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 0,
  },
});
