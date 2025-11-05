import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Divider as PaperDivider } from 'react-native-paper';

export interface DividerProps {
  style?: ViewStyle;
  bold?: boolean;
}

/**
 * Divider Component
 * Separatore universale per tutta l'app
 */
export const Divider: React.FC<DividerProps> = ({ style, bold = false }) => {
  return <PaperDivider style={[bold && styles.bold, style]} />;
};

const styles = StyleSheet.create({
  bold: {
    height: 2,
  },
});
