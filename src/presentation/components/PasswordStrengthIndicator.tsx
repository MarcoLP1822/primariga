/**
 * PasswordStrengthIndicator
 * 
 * Componente per mostrare visivamente la forza della password in tempo reale
 * durante la registrazione.
 * 
 * Features:
 * - Barra progressiva colorata
 * - Feedback testuale
 * - Suggerimenti per migliorare
 * - Animazioni smooth
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { calculatePasswordStrength } from '../../infrastructure/security/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export function PasswordStrengthIndicator({ password, show }: PasswordStrengthIndicatorProps) {
  const strengthResult = calculatePasswordStrength(password);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: strengthResult.score,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [strengthResult.score, progressAnim]);

  if (!show || !password) {
    return null;
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: strengthResult.color,
            },
          ]}
        />
      </View>

      {/* Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: strengthResult.color }]}>
          {strengthResult.feedback}
        </Text>
        <Text style={styles.scoreText}>
          {strengthResult.score}%
        </Text>
      </View>

      {/* Suggestions */}
      {strengthResult.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {strengthResult.suggestions.map((suggestion: string, index: number) => (
            <Text key={index} style={styles.suggestionText}>
              • {suggestion}
            </Text>
          ))}
        </View>
      )}

      {/* Strength Indicator Dots */}
      <View style={styles.dotsContainer}>
        {[...Array(5)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index <= strengthResult.strength
                    ? strengthResult.color
                    : '#E0E0E0',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  feedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  suggestionsContainer: {
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
