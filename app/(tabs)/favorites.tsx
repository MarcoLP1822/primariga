import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useLikedBooks } from '../../src/presentation/hooks/useLikes';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  BookInfoCard,
  EmptyState 
} from '../../src/presentation/components';
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
      <EmptyState
        emoji="💔"
        title="Nessun preferito"
        description="Inizia a esplorare i libri e aggiungi i tuoi preferiti!"
      />
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
  bookCard: {
    marginBottom: spacing.md,
  },
});
