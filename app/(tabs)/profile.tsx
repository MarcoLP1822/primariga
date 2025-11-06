import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useLikedBooks } from '../../src/presentation/hooks/useLikes';
import { useAppStore } from '../../src/infrastructure/store/store';
import { spacing } from '../../src/presentation/theme/spacing';
import { Button, Divider, AuthPrompt } from '../../src/presentation/components';
import { useState } from 'react';
import { useScreenTracking } from '../../src/presentation/hooks/useScreenTracking';

/**
 * Profile Screen - Profilo utente con statistiche
 * 
 * IMPORTANTE: Mostra AuthPrompt se l'utente è anonimo, altrimenti profilo completo
 */
export default function ProfileScreen() {
  // Track screen view
  useScreenTracking('Profile');
  
  const { data: likedBooks } = useLikedBooks();
  const seenBookIds = useAppStore((state) => state.seenBookIds);
  const clearSeenBooks = useAppStore((state) => state.clearSeenBooks);
  const logout = useAppStore((state) => state.logout);
  const isAnonymous = useAppStore((state) => state.isAnonymous);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const stats = {
    liked: likedBooks?.length || 0,
    explored: seenBookIds.length,
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  // Se utente anonimo, mostra solo statistiche di base e invito a registrarsi
  if (isAnonymous) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.emoji}>
            👋
          </Text>
          <Text variant="headlineMedium" style={styles.title}>
            Benvenuto!
          </Text>
        </View>

        <Card style={styles.statsCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.statsTitle}>
              📊 Statistiche
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.statRow}>
              <Text variant="bodyLarge">📚 Libri esplorati:</Text>
              <Text variant="titleLarge" style={styles.statValue}>
                {stats.explored}
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.anonymousNote}>
              Crea un account per salvare i tuoi preferiti e sincronizzarli su tutti i dispositivi
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              Perché creare un account?
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.benefitsList}>
              <Text variant="bodyMedium" style={styles.benefitItem}>
                ❤️ Salva i tuoi libri preferiti
              </Text>
              <Text variant="bodyMedium" style={styles.benefitItem}>
                🔄 Sincronizza tra dispositivi
              </Text>
              <Text variant="bodyMedium" style={styles.benefitItem}>
                📈 Traccia la cronologia di lettura
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.actionsCard} mode="elevated">
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => setShowAuthPrompt(true)}
              style={styles.actionButton}
              icon="account-plus"
            >
              Crea Account
            </Button>
            <Button
              mode="outlined"
              onPress={clearSeenBooks}
              style={styles.actionButton}
              icon="refresh"
            >
              Resetta libri visti
            </Button>
          </Card.Content>
        </Card>

        <AuthPrompt
          visible={showAuthPrompt}
          onDismiss={() => setShowAuthPrompt(false)}
          action="salvare i tuoi preferiti e accedere a tutte le funzionalità"
          title="Crea il tuo account"
        />
      </ScrollView>
    );
  }

  // Utente autenticato - mostra profilo completo
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.emoji}>
          👤
        </Text>
        <Text variant="headlineMedium" style={styles.title}>
          Il tuo profilo
        </Text>
      </View>

      <Card style={styles.statsCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            📊 Statistiche
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.statRow}>
            <Text variant="bodyLarge">❤️ Libri preferiti:</Text>
            <Text variant="titleLarge" style={styles.statValue}>
              {stats.liked}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodyLarge">📚 Libri esplorati:</Text>
            <Text variant="titleLarge" style={styles.statValue}>
              {stats.explored}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            Cos&apos;è Primariga?
          </Text>
          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.infoText}>
            Primariga ti aiuta a scoprire nuove letture in modo unico: leggi la prima frase di un
            libro e decidi se ti incuriosisce abbastanza da volerlo acquistare.
          </Text>
          <Text variant="bodyMedium" style={styles.infoText}>
            Esplora, salva i tuoi preferiti e trova il tuo prossimo libro da leggere!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.actionsTitle}>
            ⚙️ Azioni
          </Text>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            onPress={clearSeenBooks}
            style={styles.actionButton}
            icon="refresh"
          >
            Resetta libri visti
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.actionButton}
            icon="logout"
            loading={isLoggingOut}
            disabled={isLoggingOut}
          >
            Esci
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Primariga v1.0.0
        </Text>
        <Text variant="bodySmall" style={styles.footerText}>
          Made with ❤️
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  emoji: {
    fontSize: 64,
    lineHeight: 80,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  statsTitle: {
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontWeight: 'bold',
  },
  anonymousNote: {
    marginTop: spacing.md,
    opacity: 0.7,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    lineHeight: 22,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  infoTitle: {
    marginBottom: spacing.sm,
  },
  infoText: {
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  actionsCard: {
    marginBottom: spacing.xl,
  },
  actionsTitle: {
    marginBottom: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  footerText: {
    opacity: 0.5,
    marginBottom: spacing.xs,
  },
});
