import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Chip } from 'react-native-paper';

export interface TagProps {
  label: string;
  style?: ViewStyle;
  compact?: boolean;
}

/**
 * Tag Component
 * Tag/badge riutilizzabile per generi, categorie, ecc.
 * Corregge il problema del testo troppo vicino al bordo inferiore
 */
export const Tag: React.FC<TagProps> = ({ label, style, compact = true }) => {
  return (
    <Chip 
      style={[styles.tag, style]} 
      compact={compact}
      textStyle={styles.text}
    >
      {label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  tag: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    lineHeight: 20,
    paddingTop: 3,
    textAlignVertical: 'center',
  },
});
