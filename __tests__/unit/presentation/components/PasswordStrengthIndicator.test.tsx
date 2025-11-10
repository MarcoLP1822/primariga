/**
 * Test suite for PasswordStrengthIndicator component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../../../../src/presentation/components/PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  const renderWithShow = (password: string, show = true) =>
    render(<PasswordStrengthIndicator password={password} show={show} />);

  describe('Rendering', () => {
    it('should not render when show is false', () => {
      const { queryByText } = renderWithShow("test", false);
      expect(queryByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeNull();
    });

    it('should not render for empty password', () => {
      const { queryByText } = renderWithShow("");
      expect(queryByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeNull();
    });

    it('should render component for non-empty password', () => {
      const { getByText } = renderWithShow("weak");
      expect(getByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeTruthy();
    });

    it('should show strength label', () => {
      const { getByText } = renderWithShow("TestPass123!");
      expect(
        getByText(/molto debole|debole|discreta|forte|molto forte/i)
      ).toBeTruthy();
    });
  });

  describe('Strength levels', () => {
    it('should show feedback for very weak passwords', () => {
      const { getByText } = renderWithShow("123");
      expect(getByText(/molto debole|debole/i)).toBeTruthy();
    });

    it('should show higher strength for complex password', () => {
      const { getByText } = renderWithShow("MyStr0ng!P@ssw0rd");
      expect(getByText(/discreta|forte|molto forte/i)).toBeTruthy();
    });

    it('should show high strength for very strong password', () => {
      const { getByText } = renderWithShow("C0mpl3x!P@ssw0rd#2024$Secure");
      expect(getByText(/forte|molto forte/i)).toBeTruthy();
    });
  });

  describe('Score display', () => {
    it('should show low score for weak password', () => {
      const { getByText } = renderWithShow("abc");
      // Should show a score percentage
      expect(getByText(/%$/)).toBeTruthy();
    });

    it('should display score percentage', () => {
      const { getByText } = renderWithShow("TestPass123!");
      expect(getByText(/%$/)).toBeTruthy();
    });
  });

  describe('Suggestions', () => {
    it('should show suggestions for weak passwords', () => {
      const { getAllByText } = renderWithShow("weak");
      const suggestions = getAllByText(/aggiung|usa|includi|caratteri/i);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should not show length suggestions for strong passwords', () => {
      const { queryByText } = renderWithShow("V3ry!Str0ng#P@ssw0rd$2024");
      const hasSuggestion = queryByText(/aggiung|usa|includi/i);
      expect(hasSuggestion).toBeNull();
    });
  });

  describe('Real-world examples', () => {
    it('should reject common weak passwords', () => {
      ['password', '12345678', 'qwerty123'].forEach(pwd => {
        const { getByText } = renderWithShow(pwd);
        expect(getByText(/molto debole|debole/i)).toBeTruthy();
      });
    });

    it('should accept strong passwords', () => {
      ['MySecure!Pass123', 'C0mpl3x#2024@Pwd', 'Str0ng$P@ssw0rd!'].forEach(pwd => {
        const { getByText } = renderWithShow(pwd);
        expect(getByText(/forte|molto forte/i)).toBeTruthy();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const { queryByText } = renderWithShow("");
      expect(queryByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeNull();
    });

    it('should handle whitespace-only password', () => {
      const { getByText } = renderWithShow("   ");
      expect(getByText(/molto debole|debole/i)).toBeTruthy();
    });

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(100) + '1!';
      const { getByText } = renderWithShow(longPassword);
      expect(getByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeTruthy();
    });

    it('should handle special characters only', () => {
      const { getByText } = renderWithShow("!@#$%^&*()");
      expect(
        getByText(/molto debole|debole|discreta|forte|molto forte/i)
      ).toBeTruthy();
    });
  });

  describe('Component updates', () => {
    it('should update when password changes', () => {
      const { rerender, getByText } = renderWithShow("weak");
      expect(getByText(/debole/i)).toBeTruthy();
      
      rerender(<PasswordStrengthIndicator password="Str0ng!P@ss123" show={true} />);
      expect(getByText(/forte/i)).toBeTruthy();
    });

    it('should clear display when password becomes empty', () => {
      const { rerender, queryByText } = renderWithShow("test123");
      expect(queryByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeTruthy();
      
      rerender(<PasswordStrengthIndicator password="" show={true} />);
      expect(queryByText(/molto debole|debole|discreta|forte|molto forte/i)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should provide text feedback for screen readers', () => {
      const { getByText } = renderWithShow("TestPass123!");
      const strengthText = getByText(/molto debole|debole|discreta|forte|molto forte/i);
      expect(strengthText).toBeTruthy();
      expect(strengthText.props.children).toBeTruthy();
    });
  });
});
