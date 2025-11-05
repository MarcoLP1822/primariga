import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Button as PaperButton } from 'react-native-paper';
import {
  useRandomBook,
  useIncrementBookView,
  useIncrementBookClick,
} from '../../src/presentation/hooks/useBooks';
import { useToggleLike, useIsBookLiked } from '../../src/presentation/hooks/useLikes';
import { 
  BookLineCard, 
  LoadingSpinner, 
  ErrorMessage, 
  IconButton,
  Snackbar 
} from '../../src/presentation/components';
import { spacing } from '../../src/presentation/theme/spacing';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { useAppStore } from '../../src/infrastructure/store/store';

/**
 * Home Screen - Feed principale con scoperta libri casuali
 */
export default function HomeScreen() {
  const router = useRouter();
  const { data: book, isLoading, error, refetch } = useRandomBook();
  const incrementView = useIncrementBookView();
  const incrementClick = useIncrementBookClick();
  const toggleLike = useToggleLike();
  const { data: isLiked } = useIsBookLiked(book?.id);
  const userId = useAppStore((state) => state.userId);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Incrementa view count quando il libro viene caricato
  useEffect(() => {
    if (book?.id) {
      incrementView.mutate(book.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  const handleNext = () => {
    refetch();
  };

  const handleLike = () => {
    if (!book) return;
    
    if (!userId) {
      setSnackbarMessage('Errore: utente non identificato');
      setSnackbarVisible(true);
      return;
    }

    toggleLike.mutate(
      { bookId: book.id, isLiked: isLiked ?? false },
      {
        onSuccess: () => {
          setSnackbarMessage(isLiked ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti!');
          setSnackbarVisible(true);
        },
        onError: (error) => {
          setSnackbarMessage(`Errore nel salvataggio: ${error.message}`);
          setSnackbarVisible(true);
        },
      }
    );
  };

  const handleBuyClick = async () => {
    if (!book) return;

    // Incrementa click count
    incrementClick.mutate(book.id);

    // Apri link di acquisto (priorità: Amazon > IBS > Mondadori)
    const buyLink = book.amazonLink || book.ibsLink || book.mondadoriLink;
    if (buyLink) {
      await Linking.openURL(buyLink);
    }
  };

  const handleShowDetails = () => {
    if (!book) return;
    router.push(`/book/${book.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Caricamento...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage 
          message={`Errore nel caricamento del libro: ${error.message}`} 
          onRetry={refetch} 
        />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="titleLarge" style={styles.emptyText}>
          😔 Nessun libro disponibile
        </Text>
        <PaperButton mode="contained" onPress={handleNext} style={styles.retryButton}>
          Riprova
        </PaperButton>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleNext} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          PrimaRiga
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          La prima frase della tua prossima avventura!
        </Text>
      </View>

      <BookLineCard book={book} style={styles.bookCard} />

      <View style={styles.actionsContainer}>
        <PaperButton
          mode="outlined"
          onPress={handleLike}
          style={styles.actionButton}
          icon={isLiked ? 'heart' : 'heart-outline'}
          buttonColor={isLiked ? undefined : undefined}
          textColor={isLiked ? '#ef4444' : undefined}
        >
          {isLiked ? 'Salvato' : 'Salva'}
        </PaperButton>

        <PaperButton
          mode="outlined"
          onPress={handleShowDetails}
          style={styles.actionButton}
          icon="information"
        >
          Dettagli
        </PaperButton>

        <PaperButton
          mode="contained"
          onPress={handleBuyClick}
          style={[styles.actionButton, styles.buyButton]}
          icon="cart"
        >
          Acquista
        </PaperButton>
      </View>

      <View style={styles.nextContainer}>
        <IconButton icon="refresh" size={32} mode="contained" onPress={handleNext} />
        <Text variant="bodySmall" style={styles.nextText}>
          Prossimo libro
        </Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  bookCard: {
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
  buyButton: {},
  nextContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  nextText: {
    opacity: 0.6,
    marginTop: spacing.xs,
  },
});
