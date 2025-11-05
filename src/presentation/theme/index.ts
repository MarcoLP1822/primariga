import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

/**
 * Tema Light per React Native Paper
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    tertiary: colors.info.main,
    tertiaryContainer: colors.info.light,
    surface: colors.surface.main,
    surfaceVariant: colors.surface.variant,
    surfaceDisabled: colors.surface.disabled,
    background: colors.background.default,
    error: colors.error.main,
    errorContainer: colors.error.light,
    onPrimary: colors.primary.contrast,
    onPrimaryContainer: colors.primary.dark,
    onSecondary: colors.secondary.contrast,
    onSecondaryContainer: colors.secondary.dark,
    onTertiary: '#FFFFFF',
    onTertiaryContainer: colors.info.dark,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    onSurfaceDisabled: colors.text.disabled,
    onError: '#FFFFFF',
    onErrorContainer: colors.error.dark,
    onBackground: colors.text.primary,
    outline: colors.border,
    outlineVariant: colors.divider,
    inverseSurface: colors.text.primary,
    inverseOnSurface: colors.background.default,
    inversePrimary: colors.primary.light,
    shadow: '#000000',
    scrim: colors.scrim,
    backdrop: colors.overlay,
  },
};

/**
 * Tema Dark per React Native Paper
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.light,
    primaryContainer: colors.primary.dark,
    secondary: colors.secondary.light,
    secondaryContainer: colors.secondary.dark,
    tertiary: colors.info.light,
    tertiaryContainer: colors.info.dark,
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    surfaceDisabled: '#3A3A3A',
    background: '#121212',
    error: colors.error.light,
    errorContainer: colors.error.dark,
    onPrimary: '#000000',
    onPrimaryContainer: colors.primary.light,
    onSecondary: '#000000',
    onSecondaryContainer: colors.secondary.light,
    onTertiary: '#000000',
    onTertiaryContainer: colors.info.light,
    onSurface: '#E0E0E0',
    onSurfaceVariant: '#B0B0B0',
    onSurfaceDisabled: '#707070',
    onError: '#000000',
    onErrorContainer: colors.error.light,
    onBackground: '#E0E0E0',
    outline: '#707070',
    outlineVariant: '#3A3A3A',
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#1E1E1E',
    inversePrimary: colors.primary.dark,
    shadow: '#000000',
    scrim: colors.scrim,
    backdrop: colors.overlay,
  },
};

/**
 * Tema esteso con design tokens personalizzati
 */
export const theme = {
  light: {
    ...lightTheme,
    custom: {
      colors,
      typography,
      spacing,
      borderRadius,
    },
  },
  dark: {
    ...darkTheme,
    custom: {
      colors: {
        ...colors,
        // Override per dark mode
        background: {
          default: '#121212',
          paper: '#1E1E1E',
          elevated: '#2C2C2C',
        },
        text: {
          primary: '#E0E0E0',
          secondary: '#B0B0B0',
          disabled: '#707070',
          hint: '#5A5A5A',
        },
      },
      typography,
      spacing,
      borderRadius,
    },
  },
};

export type Theme = typeof theme.light;
export type ThemeColors = typeof theme.light.custom.colors;
