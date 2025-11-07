/**
 * Lista delle password più comuni da bloccare
 * Basata su ricerche di sicurezza e data breaches
 * 
 * Fonte: OWASP, Have I Been Pwned, NordPass research
 */

export const COMMON_PASSWORDS = [
  // Top 20 most common
  'password',
  'password123',
  '12345678',
  'qwerty',
  'abc123',
  'password1',
  '12345',
  'password!',
  '123456789',
  'qwerty123',
  '1q2w3e4r',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'dragon',
  'master',
  'sunshine',
  'princess',
  
  // Italian common passwords
  'ciaociao',
  'password123!',
  'benvenuto',
  'amoremio',
  'italianitalia',
  'juventus',
  'francesco',
  'alessandro',
  'giuseppe',
  'antonio',
  
  // Pattern-based weak passwords
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '1qaz2wsx',
  'abcd1234',
  'pass1234',
  'test1234',
  'admin123',
  'root1234',
  'user1234',
];

/**
 * Verifica se una password è nella lista delle password comuni
 * Case-insensitive per maggiore sicurezza
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}
