import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Modal, Portal, Button, Surface, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { lightTheme } from '../theme';
import { AuthService } from '../../infrastructure/auth';
import { useAppStore } from '../../infrastructure/store/store';
import { z } from 'zod';
import { analytics, AnalyticsEvent } from '../../infrastructure/analytics';
import { isCommonPassword } from '../../infrastructure/security/commonPasswords';
import { sanitizeAuthError, sanitizeOAuthError } from '../../infrastructure/security/authErrors';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

/**
 * AuthModal - Modal unificato per Login e Signup
 * 
 * Supporta due modalità:
 * 1. Form diretto (showIntro=false): Mostra subito il form login/signup
 * 2. Con introduzione (showIntro=true): Mostra prima i benefici, poi il form
 * 
 * Questo componente sostituisce sia AuthModal che AuthPrompt per un approccio DRY-compliant.
 */

export interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  /** Mostra schermata intro con benefici prima del form */
  showIntro?: boolean;
  /** Titolo personalizzato per intro (default: "Accedi per salvare i tuoi preferiti") */
  introTitle?: string;
  /** Messaggio personalizzato per intro */
  introMessage?: string;
  /** Azione specifica per personalizzare il messaggio (es. "salvare questo libro") */
  action?: string;
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password richiesta'),
});

const signupSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(8, 'Password deve contenere almeno 8 caratteri')
    .max(128, 'Password troppo lunga (max 128 caratteri)')
    .regex(/[A-Z]/, 'Deve contenere almeno una maiuscola')
    .regex(/[a-z]/, 'Deve contenere almeno una minuscola')
    .regex(/[0-9]/, 'Deve contenere almeno un numero')
    .regex(/[^A-Za-z0-9]/, 'Deve contenere almeno un carattere speciale (!@#$%^&*)')
    .refine(
      (password) => !isCommonPassword(password),
      'Password troppo comune, scegline una più sicura'
    ),
  fullName: z.string().min(2, 'Nome deve contenere almeno 2 caratteri'),
  username: z
    .string()
    .min(3, 'Username deve contenere almeno 3 caratteri')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username può contenere solo lettere, numeri e underscore'),
});

export function AuthModal({ 
  visible, 
  onClose, 
  mode = 'signup',
  showIntro = false,
  introTitle = 'Accedi per salvare i tuoi preferiti',
  introMessage,
  action = 'salvare i tuoi preferiti',
}: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);
  const [showingIntro, setShowingIntro] = useState(showIntro);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  
  const setUser = useAppStore((state) => state.setUser);

  // Constants for rate limiting
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  // Reset intro when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setShowingIntro(showIntro);
    }
  }, [visible, showIntro]);

  // Sync currentMode with mode prop when it changes
  React.useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Reset rate limiting when switching modes
  React.useEffect(() => {
    setLoginAttempts(0);
    setLockedUntil(null);
  }, [currentMode]);

  // Clear sensitive data when modal closes
  React.useEffect(() => {
    if (!visible) {
      // Small delay for smooth close animation
      const timeoutId = setTimeout(() => {
        setEmail('');
        setPassword('');
        setFullName('');
        setUsername('');
        setErrors({});
        setLoginAttempts(0);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [visible]);

  // Clear sensitive data on component unmount
  React.useEffect(() => {
    return () => {
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
      setErrors({});
    };
  }, []);

  const handleLogin = async () => {
    setErrors({});
    
    // Check if account is locked
    if (lockedUntil && new Date() < lockedUntil) {
      const remainingTime = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000 / 60);
      Alert.alert(
        'Account Temporaneamente Bloccato',
        `Troppi tentativi falliti. Riprova tra ${remainingTime} ${remainingTime === 1 ? 'minuto' : 'minuti'}.`
      );
      return;
    }
    
    analytics.track(AnalyticsEvent.LOGIN_STARTED, { auth_method: 'email' });

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      analytics.track(AnalyticsEvent.LOGIN_FAILED, { auth_method: 'email', error_type: 'validation' });
      return;
    }

    setLoading(true);
    const authResult = await AuthService.signIn({ email, password });

    if (authResult.isFailure()) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION);
        setLockedUntil(lockoutTime);
        Alert.alert(
          'Account Bloccato',
          'Troppi tentativi falliti. Account bloccato per 5 minuti per motivi di sicurezza.'
        );
        analytics.track(AnalyticsEvent.ERROR_OCCURRED, {
          error_type: 'rate_limited',
          attempts: newAttempts,
        });
        setLoading(false);
        return;
      }

      Alert.alert('Errore', sanitizeAuthError(authResult.error, 'login'));
      setLoading(false);
      return;
    }

    // Reset attempts on successful login
    setLoginAttempts(0);
    setLockedUntil(null);

    const session = authResult.value;
    setUser(session.user.id);
    analytics.track(AnalyticsEvent.LOGIN_COMPLETED, { auth_method: 'email', user_id: session.user.id });
    
    setLoading(false);
    onClose();
  };

  const handleSignup = async () => {
    setErrors({});
    
    analytics.track(AnalyticsEvent.SIGNUP_STARTED, { auth_method: 'email' });

    const result = signupSchema.safeParse({ email, password, fullName, username });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      Alert.alert('Errore Validazione', result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const authResult = await AuthService.signUp({ email, password, fullName, username });

      if (authResult.isFailure()) {
        Alert.alert('Errore', sanitizeAuthError(authResult.error, 'signup'));
        setLoading(false);
        return;
      }

      analytics.track(AnalyticsEvent.SIGNUP_COMPLETED, { auth_method: 'email' });
      
      setLoading(false);
      Alert.alert(
        '✅ Registrazione Completata!',
        'Il tuo account è stato creato con successo.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Errore', sanitizeAuthError(error as Error, 'signup'));
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    analytics.track(currentMode === 'login' ? AnalyticsEvent.LOGIN_STARTED : AnalyticsEvent.SIGNUP_STARTED, { auth_method: 'google' });
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'google' });
    if (result.isFailure()) {
      Alert.alert('Errore', sanitizeOAuthError(result.error));
    }
    setLoading(false);
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'apple' });
    if (result.isFailure()) {
      Alert.alert('Errore', sanitizeOAuthError(result.error));
    }
    setLoading(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.surface} elevation={4}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Close Button */}
            <View style={styles.header}>
              <IconButton
                icon="close"
                size={24}
                onPress={onClose}
                style={styles.closeButton}
              />
            </View>

            {/* Conditional rendering: Intro or Form */}
            {showingIntro ? (
              <IntroScreen
                title={introTitle}
                message={introMessage || `Per ${action}, hai bisogno di un account. Crea un account per sincronizzare i tuoi preferiti su tutti i dispositivi.`}
                onCreateAccount={() => {
                  setCurrentMode('signup');
                  setShowingIntro(false);
                }}
                onLogin={() => {
                  setCurrentMode('login');
                  setShowingIntro(false);
                }}
                onDismiss={onClose}
              />
            ) : (
              <>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <IconButton
                    icon="account-lock"
                    size={64}
                    iconColor={lightTheme.colors.primary}
                  />
                </View>

                {/* Title */}
                <Text style={styles.title}>
                  {currentMode === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
                </Text>

                {/* Benefits - mostrati solo in signup */}
                {currentMode === 'signup' && (
                  <View style={styles.benefitsContainer}>
                    <BenefitItem icon="heart" text="Salva i tuoi libri preferiti" />
                    <BenefitItem icon="sync" text="Sincronizza su tutti i dispositivi" />
                    <BenefitItem icon="chart-line" text="Traccia la tua cronologia di lettura" />
                  </View>
                )}

                {/* Form */}
                <View style={styles.form}>
              {currentMode === 'signup' && (
                <>
                  <Text style={styles.label}>Nome Completo</Text>
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Mario Rossi"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    editable={!loading}
                  />
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                  <Text style={styles.label}>Username</Text>
                  <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    placeholder="mario_rossi"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                    textContentType="username"
                    editable={!loading}
                  />
                  {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                </>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="tua@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={currentMode === 'login' ? 'password' : 'password-new'}
                textContentType={currentMode === 'login' ? 'password' : 'newPassword'}
                editable={!loading}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              
              {/* Password Strength Indicator - Solo in signup */}
              {currentMode === 'signup' && (
                <>
                  <PasswordStrengthIndicator password={password} show={password.length > 0} />
                  <Text style={styles.helperText}>
                    Almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale
                  </Text>
                </>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={currentMode === 'login' ? handleLogin : handleSignup}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  currentMode === 'login' ? 'Accedi' : 'Crea Account'
                )}
              </Button>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>oppure</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                mode="outlined"
                onPress={handleGoogleAuth}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                Continua con Google
              </Button>

              <Button
                mode="outlined"
                onPress={handleAppleAuth}
                style={styles.secondaryButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
              >
                Continua con Apple
              </Button>

              <Button
                mode="text"
                onPress={() => setCurrentMode(currentMode === 'login' ? 'signup' : 'login')}
                style={styles.tertiaryButton}
                disabled={loading}
              >
                {currentMode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
              </Button>

              {/* Forgot Password Link - Solo in modalità login */}
              {currentMode === 'login' && (
                <Button
                  mode="text"
                  onPress={() => {
                    onClose();
                    router.push('/(auth)/forgot-password');
                  }}
                  style={styles.tertiaryButton}
                  disabled={loading}
                >
                  Hai dimenticato la password?
                </Button>
              )}

              <Button
                mode="text"
                onPress={onClose}
                style={styles.tertiaryButton}
              >
                Continua senza account
              </Button>
            </View>
            </>
            )}
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );
}

/**
 * IntroScreen - Schermata introduttiva con benefici
 * Mostra i vantaggi di creare un account prima del form
 */
interface IntroScreenProps {
  title: string;
  message: string;
  onCreateAccount: () => void;
  onLogin: () => void;
  onDismiss: () => void;
}

function IntroScreen({ title, message, onCreateAccount, onLogin, onDismiss }: IntroScreenProps) {
  return (
    <>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <IconButton
          icon="account-lock"
          size={64}
          iconColor={lightTheme.colors.primary}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {title}
      </Text>

      {/* Message */}
      <Text style={styles.message}>
        {message}
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
          onPress={onCreateAccount}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
        >
          Crea Account
        </Button>
        <Button
          mode="outlined"
          onPress={onLogin}
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
    </>
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
      <Text style={styles.benefitText}>
        {text}
      </Text>
    </View>
  );
}

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  surface: {
    borderRadius: 16,
    backgroundColor: '#fff',
    maxWidth: 600,
    width: '90%',
    maxHeight: screenHeight * 0.85,
    overflow: 'hidden',
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
    fontSize: 20,
    marginBottom: 12,
    color: lightTheme.colors.onSurface,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
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
    fontSize: 14,
    color: lightTheme.colors.onSurfaceVariant,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: lightTheme.colors.onSurface,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#F8F8F8',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
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
