import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBook, useIncrementBookClick } from '../../src/presentation/hooks/useBooks';
import { useIsBookLiked, useToggleLike } from '../../src/presentation/hooks/useLikes';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  Button, 
  Tag, 
  Divider,
  AuthModal
} from '../../src/presentation/components';
import { spacing } from '../../src/presentation/theme/spacing';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../src/infrastructure/store/store';
import { useScreenTracking } from '../../src/presentation/hooks/useScreenTracking';
import { analytics, AnalyticsEvent } from '../../src/infrastructure/analytics';

/**
 * Book Detail Screen - Esperienza "acquisto alla cieca"
 * 
 * Mostra solo le informazioni essenziali (copertina, titolo, autore, generi).
 * I link di acquisto vengono rivelati solo quando l'utente clicca su "Acquista".
 * 
 * IMPORTANTE: Supporta utilizzo anonimo.
 * L'auth viene richiesta solo quando l'utente tenta di salvare un preferito.
 */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading, error } = useBook(id);
  const { data: isLiked } = useIsBookLiked(id);
  const toggleLike = useToggleLike();
  const incrementClick = useIncrementBookClick();
  const requiresAuth = useAppStore((state) => state.requiresAuth);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPurchaseLinks, setShowPurchaseLinks] = useState(false);
  
  // Track screen view with book context
  useScreenTracking('Book Detail', {
    book_id: id,
    book_title: book?.title,
    book_author: book?.author,
  });
  
  // Track book viewed when loaded
  useEffect(() => {
    if (book) {
      analytics.track(AnalyticsEvent.BOOK_DETAIL_OPENED, {
        book_id: book.id,
        book_title: book.title,
        book_author: book.author,
        book_genres: book.genres,
      });
    }
  }, [book]);

  const handleToggleLike = () => {
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
              screen: 'Book Detail',
            }
          );
        },
      }
    );
  };

  const handleBuyClick = async (url?: string) => {
    if (!url || !book) return;
    
    // Track purchase link click
    incrementClick.mutate(book.id);
    analytics.track(AnalyticsEvent.PURCHASE_LINK_CLICKED, {
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      screen: 'Book Detail',
    });
    
    await Linking.openURL(url);
  };

  const handleShowPurchaseLinks = () => {
    if (!book) return;
    
    setShowPurchaseLinks(true);
    
    // Track purchase button click
    analytics.track(AnalyticsEvent.PURCHASE_LINK_CLICKED, {
      book_id: book.id,
      book_title: book.title,
      book_author: book.author,
      screen: 'Book Detail',
      action: 'reveal_links',
    });
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
              <Tag key={index} label={genre} />
            ))}
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.actionsContainer}>
          <Button
            mode={isLiked ? 'contained' : 'outlined'}
            onPress={handleToggleLike}
            style={styles.actionButton}
            icon={isLiked ? 'heart' : 'heart-outline'}
          >
            {isLiked ? 'Piaciuto' : 'Mi piace'}
          </Button>

          {!showPurchaseLinks && (
            <Button
              mode="contained"
              onPress={handleShowPurchaseLinks}
              style={styles.actionButton}
              icon="cart"
            >
              Acquista
            </Button>
          )}
        </View>

        {showPurchaseLinks && (
          <>
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
          </>
        )}
      </View>
      
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
  divider: {
    marginVertical: spacing.md,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
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
