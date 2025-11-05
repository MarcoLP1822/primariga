import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useLikedBooks } from '../../src/presentation/hooks/useLikes';
import { LoadingSpinner, ErrorMessage, BookInfoCard } from '../../src/presentation/components';
import { spacing } from '../../src/presentation/theme/spacing';
import { useRouter } from 'expo-router';

/**
 * Favorites Screen - Mostra i libri piaciuti dall'utente
 */
export default function FavoritesScreen() {
  const router = useRouter();
  const { data: likedBooks, isLoading, error, refetch } = useLikedBooks();

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Caricamento preferiti...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage message="Errore nel caricamento dei preferiti" onRetry={refetch} />
      </View>
    );
  }

  if (!likedBooks || likedBooks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineMedium" style={styles.emptyIcon}>
          💔
        </Text>
        <Text variant="titleLarge" style={styles.emptyTitle}>
          Nessun preferito
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Inizia a esplorare i libri e aggiungi i tuoi preferiti!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={likedBooks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <BookInfoCard
          book={item}
          onPress={() => handleBookPress(item.id)}
          style={styles.bookCard}
        />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="titleLarge">❤️ I tuoi preferiti ({likedBooks.length})</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  listContainer: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  bookCard: {
    marginBottom: spacing.md,
  },
});
