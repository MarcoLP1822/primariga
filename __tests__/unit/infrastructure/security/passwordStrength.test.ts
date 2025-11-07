/**
 * Test suite for password strength calculator
 */

import { calculatePasswordStrength, PasswordStrength } from '../../../../src/infrastructure/security/passwordStrength';

describe('Password Strength Calculator', () => {
  describe('Empty password', () => {
    it('should return VERY_WEAK for empty password', () => {
      const result = calculatePasswordStrength('');
      
      expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('Inserisci una password');
      expect(result.color).toBe('#CCCCCC');
    });
  });

  describe('Very weak passwords', () => {
    it('should detect very weak password (too short)', () => {
      const result = calculatePasswordStrength('abc');
      
      expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
      expect(result.score).toBeLessThan(20);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should detect password with only lowercase', () => {
      const result = calculatePasswordStrength('abcdefgh');
      
      expect(result.strength).toBeLessThanOrEqual(PasswordStrength.WEAK);
      expect(result.suggestions).toContain('Aggiungi lettere maiuscole');
      expect(result.suggestions).toContain('Aggiungi numeri');
    });
  });

  describe('Weak passwords', () => {
    it('should detect weak password (missing variety)', () => {
      const result = calculatePasswordStrength('Password');
      
      expect(result.strength).toBeLessThanOrEqual(PasswordStrength.WEAK);
      expect(result.score).toBeLessThan(40);
    });

    it('should penalize repeated characters', () => {
      const result = calculatePasswordStrength('Passssword123');
      
      expect(result.score).toBeLessThan(50);
      expect(result.suggestions).toContain('Evita caratteri ripetuti');
    });

    it('should penalize numeric sequences', () => {
      const result = calculatePasswordStrength('Pass123456');
      
      expect(result.suggestions).toContain('Evita sequenze numeriche');
    });

    it('should penalize alphabetic sequences', () => {
      const result = calculatePasswordStrength('Passabc123');
      
      // Should have suggestions about patterns
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should penalize keyboard patterns', () => {
      const result = calculatePasswordStrength('Qwerty123!');
      
      expect(result.suggestions).toContain('Evita pattern da tastiera');
    });

    it('should penalize common words', () => {
      const result = calculatePasswordStrength('Password123!');
      
      expect(result.suggestions).toContain('Evita parole comuni');
    });
  });

  describe('Fair passwords', () => {
    it('should detect fair password', () => {
      const result = calculatePasswordStrength('MyPass123!');
      
      expect(result.strength).toBeGreaterThanOrEqual(PasswordStrength.FAIR);
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.feedback).toContain('Discreta');
    });
  });

  describe('Strong passwords', () => {
    it('should detect strong password', () => {
      const result = calculatePasswordStrength('MyP@ssw0rd2024');
      
      expect(result.strength).toBeGreaterThanOrEqual(PasswordStrength.STRONG);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(80);
      expect(result.feedback).toBe('Forte');
      expect(result.color).toBe('#8BC34A');
    });

    it('should have few or no suggestions', () => {
      const result = calculatePasswordStrength('MyP@ssw0rd2024');
      
      expect(result.suggestions.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Very strong passwords', () => {
    it('should detect very strong password', () => {
      const result = calculatePasswordStrength('V3ry$tr0ngP@ssw0rd!2024');
      
      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.feedback).toBe('Molto forte');
      expect(result.color).toBe('#4CAF50');
    });

    it('should award bonus for high complexity', () => {
      const result = calculatePasswordStrength('C0mpl3x!P@ssw0rd#2024$');
      
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.suggestions.length).toBe(0);
    });
  });

  describe('Length variations', () => {
    it('should score better for longer passwords', () => {
      const short = calculatePasswordStrength('P@ss1');
      const medium = calculatePasswordStrength('P@ssw0rd1');
      const long = calculatePasswordStrength('P@ssw0rd123456');
      
      expect(medium.score).toBeGreaterThan(short.score);
      expect(long.score).toBeGreaterThan(medium.score);
    });
  });

  describe('Character variety', () => {
    it('should score better with more character types', () => {
      const twoTypes = calculatePasswordStrength('password123');
      const threeTypes = calculatePasswordStrength('Password123');
      const fourTypes = calculatePasswordStrength('P@ssword123');
      
      expect(threeTypes.score).toBeGreaterThan(twoTypes.score);
      expect(fourTypes.score).toBeGreaterThan(threeTypes.score);
    });

    it('should detect all character types', () => {
      const result = calculatePasswordStrength('Abc123!@#');
      
      expect(result.suggestions).not.toContain('Aggiungi lettere maiuscole');
      expect(result.suggestions).not.toContain('Aggiungi lettere minuscole');
      expect(result.suggestions).not.toContain('Aggiungi numeri');
      expect(result.suggestions).not.toContain('Aggiungi caratteri speciali (!@#$%^&*)');
    });
  });

  describe('Score normalization', () => {
    it('should not exceed 100', () => {
      const result = calculatePasswordStrength('V3ry$tr0ngC0mpl3x!P@ssw0rd#WithL0tsOf$ymb0ls&Numb3rs!');
      
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should not go below 0', () => {
      const result = calculatePasswordStrength('a');
      
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Real-world passwords', () => {
    it('should reject common weak passwords', () => {
      const weakPasswords = [
        'password',
        'password123',
        '12345678',
        'qwerty',
        'abc123',
      ];

      weakPasswords.forEach(pwd => {
        const result = calculatePasswordStrength(pwd);
        expect(result.strength).toBeLessThanOrEqual(PasswordStrength.WEAK);
      });
    });

    it('should accept strong real-world passwords', () => {
      const strongPasswords = [
        'MyS3cur3P@ss!2024',
        'Tr0ub4dor&3#SecurePass',
        'C0rrect-H0rse-B@ttery-St@ple!',
      ];

      strongPasswords.forEach(pwd => {
        const result = calculatePasswordStrength(pwd);
        expect(result.strength).toBeGreaterThanOrEqual(PasswordStrength.FAIR);
        expect(result.score).toBeGreaterThan(50);
      });
    });
  });
});
