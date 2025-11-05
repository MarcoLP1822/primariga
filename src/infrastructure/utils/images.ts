/**
 * Image Optimization Utilities
 * 
 * Configurazione e utilities per ottimizzare immagini con Expo Image
 */

import { ImageContentFit, ImageContentPosition } from 'expo-image';

/**
 * Preset di configurazione per diversi tipi di immagini
 */
export const imagePresets = {
  /**
   * Cover per book covers - Alta qualità, aspect ratio preservato
   */
  bookCover: {
    contentFit: 'cover' as ImageContentFit,
    contentPosition: 'center' as ImageContentPosition,
    transition: 300,
    placeholder: { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }, // Placeholder grigio
    priority: 'high' as const,
    cachePolicy: 'memory-disk' as const,
  },

  /**
   * Thumbnail - Bassa qualità, piccole dimensioni
   */
  thumbnail: {
    contentFit: 'cover' as ImageContentFit,
    contentPosition: 'center' as ImageContentPosition,
    transition: 200,
    placeholder: { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' },
    priority: 'normal' as const,
    cachePolicy: 'memory' as const,
  },

  /**
   * Avatar - Circolare, piccolo
   */
  avatar: {
    contentFit: 'cover' as ImageContentFit,
    contentPosition: 'center' as ImageContentPosition,
    transition: 200,
    placeholder: { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' },
    priority: 'normal' as const,
    cachePolicy: 'memory-disk' as const,
  },

  /**
   * Background - Contain, low priority
   */
  background: {
    contentFit: 'cover' as ImageContentFit,
    contentPosition: 'center' as ImageContentPosition,
    transition: 500,
    priority: 'low' as const,
    cachePolicy: 'disk' as const,
  },
} as const;

/**
 * Generate responsive image URL con Supabase Storage transform
 * 
 * @example
 * const url = getResponsiveImageUrl(originalUrl, { width: 400, quality: 80 });
 */
export function getResponsiveImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  // Se non è Supabase storage, ritorna URL originale
  if (!url.includes('supabase')) {
    return url;
  }

  const { width, height, quality = 80, format = 'webp' } = options;

  // Costruisci query params per transform
  const params = new URLSearchParams();

  if (width) params.append('width', String(width));
  if (height) params.append('height', String(height));
  params.append('quality', String(quality));
  params.append('format', format);

  return `${url}?${params.toString()}`;
}

/**
 * Preload images per migliorare perceived performance
 * 
 * @example
 * await preloadImages([cover1, cover2, cover3]);
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const { Image } = await import('expo-image');

  await Promise.all(
    urls.map((url) =>
      Image.prefetch(url, {
        cachePolicy: 'memory-disk',
      })
    )
  );
}

/**
 * Clear image cache quando necessario (es. logout, bassa memoria)
 */
export async function clearImageCache(): Promise<void> {
  const { Image } = await import('expo-image');
  await Image.clearMemoryCache();
  await Image.clearDiskCache();
}

/**
 * Get cache size per monitoring
 */
export async function getImageCacheSize(): Promise<{
  memory: number;
  disk: number;
}> {
  // Note: Expo Image non espone direttamente cache size
  // Questa è una placeholder implementation per future monitoring
  return {
    memory: 0,
    disk: 0,
  };
}
