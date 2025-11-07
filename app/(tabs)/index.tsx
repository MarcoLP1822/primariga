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
  Snackbar,
  AuthModal
} from '../../src/presentation/components';
import { spacing } from '../../src/presentation/theme/spacing';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { useAppStore } from '../../src/infrastructure/store/store';
import { useScreenTracking } from '../../src/presentation/hooks/useScreenTracking';
import { analytics, AnalyticsEvent } from '../../src/infrastructure/analytics';

/**
 * Home Screen - Feed principale con scoperta libri casuali
 * 
 * IMPORTANTE: Supporta utilizzo anonimo. 
 * L'auth viene richiesta solo quando l'utente tenta di salvare un preferito.
 */
export default function HomeScreen() {
  // Track screen view
  useScreenTracking('Home');
  
  const { data: book, isLoading, error, refetch } = useRandomBook();
  const incrementView = useIncrementBookView();
  const incrementClick = useIncrementBookClick();
  const toggleLike = useToggleLike();
  const { data: isLiked } = useIsBookLiked(book?.id);
  const requiresAuth = useAppStore((state) => state.requiresAuth);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPurchaseLinks, setShowPurchaseLinks] = useState(false);

  // Incrementa view count quando il libro viene caricato
  useEffect(() => {
    if (book?.id) {
      incrementView.mutate(book.id);
      
      // Track book card viewed
      analytics.track(AnalyticsEvent.BOOK_CARD_VIEWED, {
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_genres: book.genres,
        screen: 'Home',
      });
      
      // Reset purchase links quando cambia libro
      setShowPurchaseLinks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  const handleNext = () => {
    refetch();
  };

  const handleLike = () => {
    if (!book) return;
    
    // Se utente anonimo, mostra AuthPrompt
    if (requiresAuth()) {
      setShowAuthPrompt(true);
      return;
    }

    // Utente autenticato - procedi con like
    toggleLike.mutate(
      { bookId: book.id, isLiked: isLiked ?? false },
      {
        onSuccess: () => {
          // Track like/unlike event
          analytics.track(
            isLiked ? AnalyticsEvent.BOOK_UNLIKED : AnalyticsEvent.BOOK_LIKED,
            {
              book_id: book.id,
              book_title: book.title,
              book_author: book.author,
              screen: 'Home',
            }
          );
          
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

    // Toggle visibility dei link
    if (!showPurchaseLinks) {
      setShowPurchaseLinks(true);
      
      // Track purchase button click
      analytics.track(AnalyticsEvent.PURCHASE_LINK_CLICKED, {
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        screen: 'Home',
        action: 'reveal_links',
      });
    } else {
      setShowPurchaseLinks(false);
    }
  };

  const handlePurchaseLinkClick = async (url: string, storeName: string) => {
    if (!book) return;

    // Incrementa click count
    incrementClick.mutate(book.id);
    
    // Track purchase link click
    analytics.track(AnalyticsEvent.PURCHASE_LINK_CLICKED, {
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      screen: 'Home',
      store: storeName,
    });

    await Linking.openURL(url);
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
          mode="contained"
          onPress={handleBuyClick}
          style={[styles.actionButton, styles.buyButton]}
          icon={showPurchaseLinks ? 'chevron-up' : 'cart'}
        >
          {showPurchaseLinks ? 'Chiudi' : 'Acquista'}
        </PaperButton>
      </View>

      {showPurchaseLinks && book && (
        <View style={styles.purchaseLinksContainer}>
          <Text variant="titleSmall" style={styles.purchaseTitle}>
            🛒 Acquista su:
          </Text>
          
          <View style={styles.purchaseButtons}>
            {book.amazonLink && (
              <PaperButton
                mode="contained"
                onPress={() => handlePurchaseLinkClick(book.amazonLink || '', 'Amazon')}
                style={styles.storeButton}
                icon="cart"
              >
                Amazon
              </PaperButton>
            )}

            {book.ibsLink && (
              <PaperButton
                mode="contained"
                onPress={() => handlePurchaseLinkClick(book.ibsLink || '', 'IBS')}
                style={styles.storeButton}
                icon="cart"
              >
                IBS
              </PaperButton>
            )}

            {book.mondadoriLink && (
              <PaperButton
                mode="contained"
                onPress={() => handlePurchaseLinkClick(book.mondadoriLink || '', 'Mondadori')}
                style={styles.storeButton}
                icon="cart"
              >
                Mondadori
              </PaperButton>
            )}

            {!book.amazonLink && !book.ibsLink && !book.mondadoriLink && (
              <Text variant="bodyMedium" style={styles.noLinksText}>
                Link di acquisto non disponibili
              </Text>
            )}
          </View>
        </View>
      )}

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

      <AuthModal
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        showIntro={true}
        action="salvare questo libro tra i preferiti"
        introTitle="Accedi per salvare i tuoi preferiti"
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
  purchaseLinksContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  purchaseTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  purchaseButtons: {
    gap: spacing.sm,
  },
  storeButton: {
    width: '100%',
  },
  noLinksText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: spacing.sm,
  },
  nextContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  nextText: {
    opacity: 0.6,
    marginTop: spacing.xs,
  },
});
