import React from 'react';
import { StyleSheet, View, ViewStyle, Image } from 'react-native';
import { Text, useTheme, Chip } from 'react-native-paper';
import { Card } from './Card';
import { spacing } from '../theme/spacing';
import { Book } from '../../domain/entities';

export interface BookInfoCardProps {
  book: Book;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * BookInfoCard Component
 * Card per mostrare informazioni sul libro
 */
export const BookInfoCard: React.FC<BookInfoCardProps> = ({
  book,
  onPress,
  style,
}) => {
  const theme = useTheme();
  
  return (
    <Card onPress={onPress} elevation="sm" style={style}>
      <View style={styles.container}>
        {book.coverImageUrl && (
          <Image 
            source={{ uri: book.coverImageUrl }} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.author, { color: theme.colors.onSurfaceVariant }]}
          >
            {book.author}
          </Text>
          {book.publicationYear && (
            <Text
              variant="bodySmall"
              style={[styles.year, { color: theme.colors.onSurfaceVariant }]}
            >
              {book.publicationYear}
            </Text>
          )}
          {book.genres && book.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {book.genres.slice(0, 2).map((genre, index) => (
                <Chip key={index} style={styles.genreChip} compact>
                  {genre}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  coverImage: {
    width: 80,
    height: 120,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  author: {
    marginBottom: spacing.xs,
  },
  year: {
    marginBottom: spacing.xs,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  genreChip: {
    height: 24,
  },
});
