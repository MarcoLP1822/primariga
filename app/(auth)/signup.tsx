import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../src/infrastructure/auth';
import { z } from 'zod';
import { useScreenTracking } from '../../src/presentation/hooks/useScreenTracking';
import { analytics, AnalyticsEvent } from '../../src/infrastructure/analytics';

/**
 * Sign Up Screen
 * 
 * Permette agli utenti di creare un nuovo account
 */

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(6, 'Password deve contenere almeno 6 caratteri')
    .regex(/[A-Z]/, 'Password deve contenere almeno una maiuscola')
    .regex(/[0-9]/, 'Password deve contenere almeno un numero'),
  fullName: z.string().min(2, 'Nome deve contenere almeno 2 caratteri'),
  username: z
    .string()
    .min(3, 'Username deve contenere almeno 3 caratteri')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username può contenere solo lettere, numeri e underscore'),
});

export default function SignupScreen() {
  // Track screen view
  useScreenTracking('Signup');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    username?: string;
  }>({});

  const handleSignup = async () => {
    // Reset errors
    setErrors({});
    
    // Track signup started
    analytics.track(AnalyticsEvent.SIGNUP_STARTED, {
      auth_method: 'email',
    });

    // Validate inputs
    const result = signupSchema.safeParse({ email, password, fullName, username });
    if (!result.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldErrors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const authResult = await AuthService.signUp({
      email,
      password,
      fullName,
      username,
    });

    if (authResult.isFailure()) {
      Alert.alert('Errore Registrazione', authResult.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    
    // Track signup completed
    analytics.track(AnalyticsEvent.SIGNUP_COMPLETED, {
      auth_method: 'email',
      has_username: !!username,
      has_full_name: !!fullName,
    });

    // Show success message
    Alert.alert(
      'Registrazione Completata',
      'Controlla la tua email per verificare il tuo account',
      [
        {
          text: 'OK',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress: () => router.replace('/(auth)/login' as any),
        },
      ]
    );
  };

  const handleGoogleSignup = async () => {
    analytics.track(AnalyticsEvent.SIGNUP_STARTED, {
      auth_method: 'google',
    });
    
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'google' });

    if (result.isFailure()) {
      Alert.alert('Errore', result.error.message);
    }
    setLoading(false);
  };

  const handleAppleSignup = async () => {
    setLoading(true);
    const result = await AuthService.signInWithOAuth({ provider: 'apple' });

    if (result.isFailure()) {
      Alert.alert('Errore', result.error.message);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crea un Account</Text>
            <Text style={styles.subtitle}>Inizia a scoprire nuovi libri</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Mario Rossi"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="mario_rossi"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

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
              <Text style={styles.helperText}>Almeno 6 caratteri, una maiuscola e un numero</Text>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Registrati</Text>
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
              onPress={handleGoogleSignup}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continua con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.oauthButton]}
              onPress={handleAppleSignup}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continua con Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hai già un account? </Text>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link href={'/(auth)/login' as any} asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.footerLink}>Accedi</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            Creando un account accetti i nostri{' '}
            <Text style={styles.termsLink}>Termini di Servizio</Text> e{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
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
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  termsLink: {
    color: '#007AFF',
  },
});
