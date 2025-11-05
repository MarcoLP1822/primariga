/**
 * Security Utilities
 * 
 * Input sanitization, XSS prevention, and security helpers
 */

/**
 * Sanitize user input to prevent XSS attacks
 * 
 * @example
 * const safeTitle = sanitizeInput(userInput);
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize HTML to allow only safe tags
 * 
 * Useful per content che può contenere basic formatting
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Whitelist di tag sicuri
  const allowedTags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br'];
  const tagRegex = new RegExp(`</?(?!(?:${allowedTags.join('|')})\\b)[^>]+>`, 'gi');

  let sanitized = html.replace(tagRegex, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Validate e sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Validate e sanitize URL
 */
export function sanitizeURL(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);

    // Allow solo http e https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Escape special characters per SQL-like queries
 * 
 * Note: Supabase usa prepared statements, ma utility per altri casi
 */
export function escapeSQLLike(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  // Max 10MB
  const MAX_SIZE = 10 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Allowed image types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only images allowed.',
    };
  }

  // Validate file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'Invalid file extension',
    };
  }

  return { valid: true };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';

  // Use crypto if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return token;
}

/**
 * Rate limiting con simple in-memory store
 * 
 * Note: In produzione usare Redis o simile
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check se request è allowed
   * 
   * @param key - Identifier (es. user ID, IP)
   * @param limit - Max requests
   * @param windowMs - Time window in milliseconds
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old timestamps outside window
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
      return false; // Rate limit exceeded
    }

    // Add current timestamp
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return true; // Request allowed
  }

  /**
   * Clear rate limit per key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Mask sensitive data per logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (typeof data !== 'string' || data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }

  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);

  return masked + visible;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one special character');
  }

  // Common patterns check
  const commonPatterns = ['password', '123456', 'qwerty', 'abc123'];
  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    score -= 2;
    feedback.push('Avoid common patterns');
  }

  return {
    valid: score >= 4,
    score: Math.max(0, score),
    feedback,
  };
}
