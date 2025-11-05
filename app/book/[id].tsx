import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBook } from '../../src/presentation/hooks/useBooks';
import { useIsBookLiked, useToggleLike } from '../../src/presentation/hooks/useLikes';
import { LoadingSpinner, ErrorMessage } from '../../src/presentation/components';
import { spacing } from '../../src/presentation/theme/spacing';
import * as Linking from 'expo-linking';

/**
 * Book Detail Screen - Dettagli completi di un libro
 */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading, error } = useBook(id);
  const { data: isLiked } = useIsBookLiked(id);
  const toggleLike = useToggleLike();

  const handleToggleLike = () => {
    if (!book) return;
    toggleLike.mutate({ bookId: book.id, isLiked: isLiked ?? false });
  };

  const handleBuyClick = async (url?: string) => {
    if (!url) return;
    await Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage message="Errore nel caricamento del libro" onRetry={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {book.coverImageUrl && (
        <Image source={{ uri: book.coverImageUrl }} style={styles.coverImage} resizeMode="cover" />
      )}

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {book.title}
        </Text>

        <Text variant="titleMedium" style={styles.author}>
          di {book.author}
        </Text>

        {book.genres && book.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {book.genres.map((genre, index) => (
              <Chip key={index} style={styles.genreChip} compact>
                {genre}
              </Chip>
            ))}
          </View>
        )}

        <Divider style={styles.divider} />

        {book.description && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              📖 Descrizione
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {book.description}
            </Text>
            <Divider style={styles.divider} />
          </>
        )}

        <View style={styles.infoGrid}>
          {book.publisher && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">Editore:</Text>
              <Text variant="bodyMedium">{book.publisher}</Text>
            </View>
          )}

          {book.publicationYear && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">Anno:</Text>
              <Text variant="bodyMedium">{book.publicationYear}</Text>
            </View>
          )}

          {book.pageCount && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">Pagine:</Text>
              <Text variant="bodyMedium">{book.pageCount}</Text>
            </View>
          )}

          {book.language && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">Lingua:</Text>
              <Text variant="bodyMedium">{book.language.toUpperCase()}</Text>
            </View>
          )}

          {book.isbn && (
            <View style={styles.infoRow}>
              <Text variant="labelLarge">ISBN:</Text>
              <Text variant="bodyMedium">{book.isbn}</Text>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionsContainer}>
          <Button
            mode={isLiked ? 'contained' : 'outlined'}
            onPress={handleToggleLike}
            style={styles.likeButton}
            icon={isLiked ? 'heart' : 'heart-outline'}
          >
            {isLiked ? 'Piaciuto' : 'Mi piace'}
          </Button>
        </View>

        <Text variant="titleSmall" style={styles.buyTitle}>
          🛒 Acquista su:
        </Text>

        <View style={styles.buyLinksContainer}>
          {book.amazonLink && (
            <Button
              mode="contained"
              onPress={() => handleBuyClick(book.amazonLink)}
              style={styles.buyButton}
              icon="cart"
            >
              Amazon
            </Button>
          )}

          {book.ibsLink && (
            <Button
              mode="contained"
              onPress={() => handleBuyClick(book.ibsLink)}
              style={styles.buyButton}
              icon="cart"
            >
              IBS
            </Button>
          )}

          {book.mondadoriLink && (
            <Button
              mode="contained"
              onPress={() => handleBuyClick(book.mondadoriLink)}
              style={styles.buyButton}
              icon="cart"
            >
              Mondadori
            </Button>
          )}

          {!book.amazonLink && !book.ibsLink && !book.mondadoriLink && (
            <Text variant="bodyMedium" style={styles.noBuyLinks}>
              Link di acquisto non disponibili
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  author: {
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  genreChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  likeButton: {
    width: '100%',
  },
  buyTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  buyLinksContainer: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  buyButton: {
    width: '100%',
  },
  noBuyLinks: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: spacing.md,
  },
});
