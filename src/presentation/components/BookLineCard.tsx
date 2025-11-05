import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { textStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Book } from '../../domain/entities';
import { useBookLine } from '../hooks/useBooks';
import { LoadingSpinner } from './LoadingSpinner';

export interface BookLineCardProps {
  book: Book;
  onLikePress?: () => void;
  isLiked?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * BookLineCard Component
 * Card specializzata per mostrare la prima riga di un libro
 */
export const BookLineCard: React.FC<BookLineCardProps> = ({
  book,
  onLikePress,
  isLiked = false,
  style,
  textStyle,
}) => {
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
      ) : (
        <>
          <Text
            style={[
              styles.lineText,
              {
                color: theme.colors.onSurface,
                ...textStyles.bookLine,
              },
              textStyle,
            ]}
          >
            "{bookLine?.lineText || 'Prima riga non disponibile'}"
          </Text>
          
          {onLikePress && (
            <IconButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              iconColor={isLiked ? theme.colors.error : theme.colors.onSurfaceVariant}
              size={28}
              onPress={onLikePress}
              style={styles.likeButton}
            />
          )}
        </>
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lineText: {
    textAlign: 'center',
  },
  likeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});
