import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { spacing } from '../src/presentation/theme/spacing';

/**
 * 404 Screen - Pagina non trovata
 */
export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="displayLarge" style={styles.emoji}>
        🤔
      </Text>
      <Text variant="headlineMedium" style={styles.title}>
        Pagina non trovata
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Ops! Sembra che questa pagina non esista.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/')}
        style={styles.button}
        icon="home"
      >
        Torna alla Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
