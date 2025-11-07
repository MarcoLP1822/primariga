import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Chip } from 'react-native-paper';

export interface TagProps {
  label: string;
  style?: ViewStyle;
  compact?: boolean;
}

/**
 * Mappa i generi letterari ai loro colori distintivi
 * Colori scelti per garantire buon contrasto e leggibilità
 */
const GENRE_COLORS: Record<string, { background: string; text: string }> = {
  // Giallo/Thriller
  'Giallo': { background: '#FEF3C7', text: '#92400E' },
  
  // Storico
  'Storico': { background: '#FECACA', text: '#7F1D1D' },
  'Romanzo storico': { background: '#FECACA', text: '#7F1D1D' },
  
  // Filosofico/Esistenziale
  'Filosofico': { background: '#DBEAFE', text: '#1E3A8A' },
  'Esistenziale': { background: '#DBEAFE', text: '#1E3A8A' },
  
  // Distopico/Fantascienza
  'Distopico': { background: '#E9D5FF', text: '#6B21A8' },
  'Fantascienza': { background: '#E9D5FF', text: '#6B21A8' },
  
  // Politico/Testimonianza
  'Politico': { background: '#E2E8F0', text: '#1E293B' },
  'Testimonianza': { background: '#E2E8F0', text: '#1E293B' },
  
  // Romantico/Drammatico
  'Romantico': { background: '#FCE7F3', text: '#9F1239' },
  'Drammatico': { background: '#FCE7F3', text: '#9F1239' },
  
  // Classico
  'Classico': { background: '#D1FAE5', text: '#065F46' },
  
  // Favola/Young Adult
  'Favola': { background: '#DBEAFE', text: '#075985' },
  'Young Adult': { background: '#DBEAFE', text: '#075985' },
  
  // Realismo magico/Surrealista
  'Realismo magico': { background: '#FFEDD5', text: '#9A3412' },
  'Surrealista': { background: '#FFEDD5', text: '#9A3412' },
  
  // Epico/Avventura
  'Epico': { background: '#FEE2E2', text: '#991B1B' },
  'Avventura': { background: '#FEE2E2', text: '#991B1B' },
  
  // Fantasy
  'Fantasy': { background: '#F3E8FF', text: '#7E22CE' },
  
  // Psicologico
  'Psicologico': { background: '#E0E7FF', text: '#3730A3' },
  
  // Memoir
  'Memoir': { background: '#E7E5E4', text: '#57534E' },
  
  // Contemporaneo/Romanzo
  'Contemporaneo': { background: '#BFDBFE', text: '#1E40AF' },
  'Romanzo': { background: '#BFDBFE', text: '#1E40AF' },
};

/**
 * Ottiene i colori per un genere specifico
 * Se il genere non è mappato, restituisce colori predefiniti
 */
const getGenreColors = (genre: string) => {
  return GENRE_COLORS[genre] || { background: '#F1F5F9', text: '#475569' };
};

/**
 * Tag Component
 * Tag/badge riutilizzabile per generi, categorie, ecc.
 * Responsive e accessibile - si adatta automaticamente al contenuto
 * Con colori distintivi per ogni genere letterario
 */
export const Tag: React.FC<TagProps> = ({ label, style, compact = true }) => {
  const colors = getGenreColors(label);
  
  return (
    <Chip 
      style={[
        styles.tag, 
        { backgroundColor: colors.background },
        style
      ]} 
      compact={compact}
      textStyle={[styles.text, { color: colors.text }]}
      mode="flat"
    >
      {label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  tag: {
    // Rimuoviamo height fissa - lasciamo che si adatti al contenuto
    minHeight: 32, // Altezza minima per garantire buon tocco su mobile
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2, // Spazio verticale per non sovrapporre
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 4, // Padding verticale per dare respiro al testo
    textAlignVertical: 'center',
  },
});
