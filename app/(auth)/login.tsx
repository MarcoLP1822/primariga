import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Surface, IconButton } from 'react-native-paper';
import { AuthService } from '../../src/infrastructure/auth';
import { useAppStore } from '../../src/infrastructure/store/store';
import { z } from 'zod';
import { useScreenTracking } from '../../src/presentation/hooks/useScreenTracking';
import { analytics, AnalyticsEvent } from '../../src/infrastructure/analytics';
import { lightTheme } from '../../src/presentation/theme';

/**
 * Login Screen
 * 
 * Permette agli utenti di fare login con email/password
 * oppure tramite OAuth (Google, Apple)
 */

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve contenere almeno 6 caratteri'),
});

export default function LoginScreen() {
  // Track screen view
  useScreenTracking('Login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const setUser = useAppStore((state) => state.setUser);

  const handleLogin = async () => {
    // Reset errors
    setErrors({});

    // Track login attempt
    analytics.track(AnalyticsEvent.LOGIN_STARTED, {
      auth_method: 'email',
    });

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as 'email' | 'password'] = err.message;
        }
      });
      setErrors(fieldErrors);
      
      analytics.track(AnalyticsEvent.LOGIN_FAILED, {
        auth_method: 'email',
        error_type: 'validation',
      });
      return;
    }

    setLoading(true);

    const authResult = await AuthService.signIn({ email, password });

    if (authResult.isFailure()) {
      Alert.alert('Errore Login', authResult.error.message);
      
      analytics.track(AnalyticsEvent.LOGIN_FAILED, {
        auth_method: 'email',
        error_type: 'auth_error',
        error_message: authResult.error.message,
      });
      
      setLoading(false);
      return;
    }

    // Update store with user ID
    const session = authResult.value;
    setUser(session.user.id);
    
    // Track successful login
    analytics.track(AnalyticsEvent.LOGIN_COMPLETED, {
      auth_method: 'email',
      user_id: session.user.id,
    });

    setLoading(false);

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = async () => {
    analytics.track(AnalyticsEvent.LOGIN_STARTED, {
      auth_method: 'google',
    });
    
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'google' });
    
    if (result.isFailure()) {
      Alert.alert('Errore', result.error.message);
      analytics.track(AnalyticsEvent.LOGIN_FAILED, {
        auth_method: 'google',
        error_message: result.error.message,
      });
    }
    // OAuth redirect gestito dal browser/sistema
    setLoading(false);
  };

  const handleAppleLogin = async () => {
    analytics.track(AnalyticsEvent.LOGIN_STARTED, {
      auth_method: 'apple',
    });
    
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'apple' });
    
    if (result.isFailure()) {
      Alert.alert('Errore', result.error.message);
      analytics.track(AnalyticsEvent.LOGIN_FAILED, {
        auth_method: 'apple',
        error_message: result.error.message,
      });
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface style={styles.surface} elevation={4}>
          {/* Close Button */}
          <View style={styles.header}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => router.replace('/(tabs)')}
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
          <Text style={styles.title}>Accedi per salvare i tuoi preferiti</Text>

          {/* Message */}
          <Text style={styles.message}>
            Per salvare questo libro tra i preferiti, hai bisogno di un account. Crea un account per sincronizzare i tuoi preferiti su tutti i dispositivi.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <BenefitItem icon="heart" text="Salva i tuoi libri preferiti" />
            <BenefitItem icon="sync" text="Sincronizza su tutti i dispositivi" />
            <BenefitItem icon="chart-line" text="Traccia la tua cronologia di lettura" />
          </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="tua@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot Password Link */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/(auth)/forgot-password' as any} asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.forgotPassword}>Password dimenticata?</Text>
            </TouchableOpacity>
          </Link>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Accedi</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oppure</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <TouchableOpacity
            style={[styles.button, styles.oauthButton]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.oauthButtonText}>Continua con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.oauthButton]}
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <Text style={styles.oauthButtonText}>Continua con Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Non hai un account? </Text>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Link href={'/(auth)/signup' as any} asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.footerLink}>Registrati</Text>
            </TouchableOpacity>
          </Link>
        </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

// Helper component for benefits
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
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
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
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    margin: 0,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: lightTheme.colors.onSurface,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
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
  forgotPassword: {
    fontSize: 14,
    color: '#1E3A5F',
    textAlign: 'right',
    marginBottom: 24,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1E3A5F',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  oauthButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#1E3A5F',
    fontWeight: '600',
  },
});
