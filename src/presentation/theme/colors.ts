/**
 * Color Palette per Primariga
 * Tema ispirato alla lettura e ai libri
 */
export const colors = {
  // Primary - Blu profondo come le copertine classiche
  primary: {
    main: '#1E3A5F',
    light: '#4A6FA5',
    dark: '#0F1E3A',
    contrast: '#FFFFFF',
  },
  
  // Secondary - Oro caldo per gli accenti
  secondary: {
    main: '#D4AF37',
    light: '#F0D068',
    dark: '#A68521',
    contrast: '#1E3A5F',
  },
  
  // Background
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    elevated: '#F5F5F5',
  },
  
  // Text
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    disabled: '#999999',
    hint: '#BBBBBB',
  },
  
  // Surface
  surface: {
    main: '#FFFFFF',
    variant: '#F5F5F5',
    disabled: '#E0E0E0',
  },
  
  // Status colors
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
  },
  
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  
  // Dividers and borders
  divider: '#E0E0E0',
  border: '#CCCCCC',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.32)',
};

export type ColorPalette = typeof colors;
