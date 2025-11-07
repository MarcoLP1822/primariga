import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../src/infrastructure/auth';
import { z } from 'zod';
import { analytics, AnalyticsEvent } from '../../src/infrastructure/analytics';

/**
 * Forgot Password Screen
 * 
 * Permette agli utenti di richiedere il reset della password tramite email.
 * 
 * Security features:
 * - Email validation
 * - Error sanitization (no user enumeration)
 * - Analytics tracking
 * - AutoComplete support
 */

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Email non valida'),
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    // Reset error
    setError('');

    // Validate input
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Email non valida');
      analytics.track(AnalyticsEvent.PASSWORD_RESET_REQUESTED, {
        success: false,
        error_type: 'validation',
      });
      return;
    }

    setLoading(true);

    analytics.track(AnalyticsEvent.PASSWORD_RESET_REQUESTED, {
      success: false,
      step: 'started',
    });

    const authResult = await AuthService.resetPassword({ email });

    if (authResult.isFailure()) {
      // Sanitize error to prevent user enumeration
      setError('Se l\'email esiste nel nostro sistema, riceverai un link per il reset.');
      analytics.track(AnalyticsEvent.PASSWORD_RESET_REQUESTED, {
        success: false,
        error_type: 'auth_error',
      });
      setLoading(false);
      // Still show success to prevent enumeration
      setTimeout(() => {
        setSent(true);
      }, 500);
      return;
    }

    analytics.track(AnalyticsEvent.PASSWORD_RESET_REQUESTED, {
      success: true,
    });

    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Email Inviata</Text>
            <Text style={styles.successText}>
              Controlla la tua casella di posta. Ti abbiamo inviato un link per reimpostare la password.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Torna al Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Indietro</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Password Dimenticata?</Text>
          <Text style={styles.subtitle}>
            Inserisci la tua email e ti invieremo un link per reimpostare la password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="tua@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Invia Link di Reset</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
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
    lineHeight: 22,
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
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
