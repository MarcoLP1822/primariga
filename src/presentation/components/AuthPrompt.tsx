import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, Button, Text, Surface, IconButton } from 'react-native-paper';
import { useRouter, Href } from 'expo-router';
import { lightTheme } from '../theme';

/**
 * AuthPrompt - Modal che appare quando un utente anonimo tenta un'azione che richiede autenticazione
 * 
 * Questo component implementa il pattern "soft auth" - non forza il login, ma spiega i benefici
 * di avere un account e offre opzioni chiare per login/signup.
 * 
 * @example
 * ```tsx
 * const [showAuthPrompt, setShowAuthPrompt] = useState(false);
 * 
 * const handleLike = () => {
 *   if (requiresAuth()) {
 *     setShowAuthPrompt(true);
 *   } else {
 *     saveLike();
 *   }
 * };
 * 
 * return (
 *   <>
 *     <Button onPress={handleLike}>Like</Button>
 *     <AuthPrompt 
 *       visible={showAuthPrompt}
 *       onDismiss={() => setShowAuthPrompt(false)}
 *       action="salvare questo libro tra i preferiti"
 *     />
 *   </>
 * );
 * ```
 */
interface AuthPromptProps {
  /** Se il modal è visibile */
  visible: boolean;
  /** Callback quando il modal viene chiuso */
  onDismiss: () => void;
  /** L'azione che l'utente voleva fare (es. "salvare questo libro tra i preferiti") */
  action?: string;
  /** Titolo personalizzato (default: "Accedi per continuare") */
  title?: string;
  /** Messaggio personalizzato (default basato su action) */
  message?: string;
}

export function AuthPrompt({
  visible,
  onDismiss,
  action = 'salvare i tuoi preferiti',
  title = 'Accedi per continuare',
  message,
}: AuthPromptProps) {
  const router = useRouter();

  const handleLogin = () => {
    onDismiss();
    router.push('/(auth)/login' as Href);
  };

  const handleSignup = () => {
    onDismiss();
    router.push('/(auth)/signup' as Href);
  };

  const defaultMessage = `Per ${action}, hai bisogno di un account. Crea un account per sincronizzare i tuoi preferiti su tutti i dispositivi.`;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.surface} elevation={4}>
          {/* Close Button */}
          <View style={styles.header}>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <IconButton
              icon="account-lock"
              size={64}
              iconColor={lightTheme.colors.primary}
            />
          </View>

          {/* Title */}
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>

          {/* Message */}
          <Text variant="bodyMedium" style={styles.message}>
            {message || defaultMessage}
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <BenefitItem icon="heart" text="Salva i tuoi libri preferiti" />
            <BenefitItem icon="sync" text="Sincronizza su tutti i dispositivi" />
            <BenefitItem icon="chart-line" text="Traccia la tua cronologia di lettura" />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Crea Account
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogin}
              style={styles.secondaryButton}
              contentStyle={styles.buttonContent}
            >
              Ho già un account
            </Button>
            <Button
              mode="text"
              onPress={onDismiss}
              style={styles.tertiaryButton}
            >
              Continua senza account
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

/**
 * Componente per mostrare un singolo beneficio con icona
 */
interface BenefitItemProps {
  icon: string;
  text: string;
}

function BenefitItem({ icon, text }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <IconButton
        icon={icon}
        size={20}
        iconColor={lightTheme.colors.primary}
        style={styles.benefitIcon}
      />
      <Text variant="bodySmall" style={styles.benefitText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: -8,
  },
  closeButton: {
    margin: 0,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
    color: lightTheme.colors.onSurface,
  },
  message: {
    textAlign: 'center',
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 24,
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitIcon: {
    margin: 0,
  },
  benefitText: {
    flex: 1,
    color: lightTheme.colors.onSurfaceVariant,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
  },
  tertiaryButton: {
    marginTop: 4,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
