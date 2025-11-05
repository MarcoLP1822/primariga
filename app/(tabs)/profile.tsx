import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useLikedBooks } from '../../src/presentation/hooks/useLikes';
import { useAppStore } from '../../src/infrastructure/store/store';
import { spacing } from '../../src/presentation/theme/spacing';
import { useState, useEffect } from 'react';

/**
 * Profile Screen - Profilo utente con statistiche
 */
export default function ProfileScreen() {
  const { data: likedBooks } = useLikedBooks();
  const seenBookIds = useAppStore((state) => state.seenBookIds);
  const clearSeenBooks = useAppStore((state) => state.clearSeenBooks);
  const userId = useAppStore((state) => state.userId);
  const setUser = useAppStore((state) => state.setUser);

  // Genera un ID utente se non esiste (per MVP, in futuro con auth Supabase)
  useEffect(() => {
    if (!userId) {
      const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUser(tempUserId);
    }
  }, [userId, setUser]);

  const stats = {
    liked: likedBooks?.length || 0,
    explored: seenBookIds.length,
  };

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
            🎭 Cos'è Primariga?
          </Text>
          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.infoText}>
            Primariga ti aiuta a scoprire nuove letture in modo unico: leggi la prima riga di un
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
    marginBottom: spacing.sm,
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
