import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Book } from '../../domain/entities';
import { useBookLine } from '../hooks/useBooks';
import { LoadingSpinner } from './LoadingSpinner';

export interface BookLineCardProps {
  book: Book;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * BookLineCard Component
 * Card specializzata per mostrare la prima riga di un libro
 */
export const BookLineCard: React.FC<BookLineCardProps> = ({ book, style, textStyle }) => {
  const theme = useTheme();
  const { data: bookLine, isLoading } = useBookLine(book.id);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : bookLine ? (
        <View style={styles.contentWrapper}>
          <Text
            style={[
              {
                color: theme.colors.onSurface,
                ...textStyles.bookLine,
              },
              styles.lineText, // Applied after to override lineHeight
              textStyle,
            ]}
          >
            &ldquo;{bookLine.lineText}&rdquo;
          </Text>
        </View>
      ) : (
        <Text style={styles.errorText}>Impossibile caricare la prima frase</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  contentWrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineText: {
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
    lineHeight: 30, // Override textStyles.bookLine lineHeight to prevent text overlap
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
