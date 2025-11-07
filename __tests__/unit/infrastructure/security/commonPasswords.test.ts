/**
 * Test suite for common passwords checker
 */

import { isCommonPassword, COMMON_PASSWORDS } from '../../../../src/infrastructure/security/commonPasswords';

describe('Common Passwords Checker', () => {
  describe('isCommonPassword', () => {
    it('should detect common English passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('password123')).toBe(true);
      expect(isCommonPassword('12345678')).toBe(true);
      expect(isCommonPassword('qwerty')).toBe(true);
      expect(isCommonPassword('abc123')).toBe(true);
    });

    it('should detect common Italian passwords', () => {
      expect(isCommonPassword('ciaociao')).toBe(true);
      expect(isCommonPassword('benvenuto')).toBe(true);
      expect(isCommonPassword('juventus')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isCommonPassword('PASSWORD')).toBe(true);
      expect(isCommonPassword('Password')).toBe(true);
      expect(isCommonPassword('PaSsWoRd')).toBe(true);
      expect(isCommonPassword('QWERTY')).toBe(true);
      expect(isCommonPassword('CiaoCiao')).toBe(true);
    });

    it('should not flag secure passwords', () => {
      expect(isCommonPassword('MyS3cur3P@ss!')).toBe(false);
      expect(isCommonPassword('Tr0ub4dor&3')).toBe(false);
      expect(isCommonPassword('C0rrect-H0rse-B@ttery')).toBe(false);
    });

    it('should handle empty string', () => {
      expect(isCommonPassword('')).toBe(false);
    });

    it('should handle pattern-based weak passwords', () => {
      expect(isCommonPassword('qwertyuiop')).toBe(true);
      expect(isCommonPassword('asdfghjkl')).toBe(true);
      expect(isCommonPassword('1qaz2wsx')).toBe(true);
    });
  });

  describe('COMMON_PASSWORDS list', () => {
    it('should contain at least 40 passwords', () => {
      expect(COMMON_PASSWORDS.length).toBeGreaterThanOrEqual(40);
    });

    it('should be all lowercase', () => {
      COMMON_PASSWORDS.forEach(pwd => {
        expect(pwd).toBe(pwd.toLowerCase());
      });
    });

    it('should not have duplicates', () => {
      const uniquePasswords = new Set(COMMON_PASSWORDS);
      expect(uniquePasswords.size).toBe(COMMON_PASSWORDS.length);
    });

    it('should contain top common passwords', () => {
      const mustHave = ['password', 'qwerty', '12345678', 'abc123', 'admin'];
      
      mustHave.forEach(pwd => {
        expect(COMMON_PASSWORDS).toContain(pwd);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in password', () => {
      expect(isCommonPassword('password!')).toBe(true);
      expect(isCommonPassword('password123!')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isCommonPassword('password ')).toBe(false);
      expect(isCommonPassword(' password')).toBe(false);
    });

    it('should handle numeric strings', () => {
      expect(isCommonPassword('12345678')).toBe(true);
      expect(isCommonPassword('123456789')).toBe(true);
    });
  });
});
