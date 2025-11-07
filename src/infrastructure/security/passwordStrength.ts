/**
 * Password Strength Calculator
 * 
 * Calcola la forza di una password basandosi su:
 * - Lunghezza
 * - Varietà di caratteri (lowercase, uppercase, numbers, symbols)
 * - Pattern comuni
 * - Entropia
 */

export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  FAIR = 2,
  STRONG = 3,
  VERY_STRONG = 4,
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string;
  color: string;
  suggestions: string[];
}

/**
 * Calcola la forza della password
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: PasswordStrength.VERY_WEAK,
      score: 0,
      feedback: 'Inserisci una password',
      color: '#CCCCCC',
      suggestions: [],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // 1. Lunghezza (max 30 punti)
  const length = password.length;
  if (length >= 16) {
    score += 30;
  } else if (length >= 12) {
    score += 25;
  } else if (length >= 8) {
    score += 15;
  } else {
    score += Math.min(length * 2, 10);
    suggestions.push('Usa almeno 8 caratteri');
  }

  // 2. Varietà di caratteri (max 40 punti)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const varietyScore = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  score += varietyScore * 10;

  if (!hasUppercase) suggestions.push('Aggiungi lettere maiuscole');
  if (!hasLowercase) suggestions.push('Aggiungi lettere minuscole');
  if (!hasNumbers) suggestions.push('Aggiungi numeri');
  if (!hasSymbols) suggestions.push('Aggiungi caratteri speciali (!@#$%^&*)');

  // 3. Sequenze e pattern (penalità)
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push('Evita caratteri ripetuti');
  }

  if (/123|234|345|456|567|678|789|890/.test(password)) {
    score -= 10;
    suggestions.push('Evita sequenze numeriche');
  }

  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    score -= 10;
    suggestions.push('Evita sequenze alfabetiche');
  }

  // 4. Pattern tastiera comuni
  if (/qwerty|asdfgh|zxcvbn/i.test(password)) {
    score -= 15;
    suggestions.push('Evita pattern da tastiera');
  }

  // 5. Parole comuni italiane/inglesi (sample)
  const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'ciao', 'amore', 'casa'];
  if (commonWords.some(word => password.toLowerCase().includes(word))) {
    score -= 20;
    suggestions.push('Evita parole comuni');
  }

  // 6. Bonus per complessità
  if (length >= 12 && varietyScore === 4) {
    score += 10;
  }

  // Normalizza score (0-100)
  score = Math.max(0, Math.min(100, score));

  // Determina livello e feedback
  let strength: PasswordStrength;
  let feedback: string;
  let color: string;

  if (score >= 80) {
    strength = PasswordStrength.VERY_STRONG;
    feedback = 'Molto forte';
    color = '#4CAF50'; // Green
  } else if (score >= 60) {
    strength = PasswordStrength.STRONG;
    feedback = 'Forte';
    color = '#8BC34A'; // Light green
  } else if (score >= 40) {
    strength = PasswordStrength.FAIR;
    feedback = 'Discreta';
    color = '#FFC107'; // Amber
  } else if (score >= 20) {
    strength = PasswordStrength.WEAK;
    feedback = 'Debole';
    color = '#FF9800'; // Orange
  } else {
    strength = PasswordStrength.VERY_WEAK;
    feedback = 'Molto debole';
    color = '#F44336'; // Red
  }

  return {
    strength,
    score,
    feedback,
    color,
    suggestions: suggestions.slice(0, 2), // Max 2 suggestions
  };
}
