/**
 * OptimizedImage Component
 * 
 * Wrapper per Expo Image con optimization automatiche
 */

import React, { useState } from 'react';
import { Image, ImageProps, ImageErrorEventData } from 'expo-image';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  imagePresets,
  getResponsiveImageUrl,
} from '../../infrastructure/utils/images';

type ImagePreset = keyof typeof imagePresets;

interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'onError'> {
  /**
   * URL dell'immagine
   */
  source: string;

  /**
   * Preset predefinito da utilizzare
   */
  preset?: ImagePreset;

  /**
   * Dimensioni responsive per transform
   */
  responsive?: {
    width?: number;
    height?: number;
    quality?: number;
  };

  /**
   * Mostra loading spinner
   */
  showLoading?: boolean;

  /**
   * Callback su errore
   */
  onError?: (error: ImageErrorEventData) => void;
}

/**
 * OptimizedImage - Image component con automatic optimization
 * 
 * Features:
 * - Preset configurabili (bookCover, thumbnail, avatar, background)
 * - Responsive image transforms via Supabase Storage
 * - Loading states con spinner
 * - Error handling con placeholder
 * - Memory e disk caching automatici
 * 
 * @example
 * <OptimizedImage
 *   source={book.coverImageUrl}
 *   preset="bookCover"
 *   responsive={{ width: 400, quality: 80 }}
 *   style={{ width: 200, height: 300 }}
 * />
 */
export function OptimizedImage({
  source,
  preset = 'thumbnail',
  responsive,
  showLoading = true,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Apply preset
  const presetConfig = imagePresets[preset];

  // Generate responsive URL se specificato
  const imageUrl = responsive
    ? getResponsiveImageUrl(source, responsive)
    : source;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: ImageErrorEventData) => {
    setIsLoading(false);
    setHasError(true);
    if (onError) {
      onError(error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUrl }}
        {...presetConfig}
        {...props}
        style={[styles.image, style]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {/* Loading overlay */}
      {showLoading && isLoading && !hasError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {/* Error placeholder */}
      {hasError && (
        <View
          style={[
            styles.errorPlaceholder,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  errorPlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
});
