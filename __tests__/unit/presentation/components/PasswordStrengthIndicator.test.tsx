/**
 * Test suite for PasswordStrengthIndicator component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../../../../src/presentation/components/PasswordStrengthIndicator';

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RN = jest.requireActual('react-native');
  return {
    Text: RN.Text,
    ProgressBar: ({ progress, color, style }: any) => (
      <RN.View
        testID="progress-bar"
        style={[style, { backgroundColor: color }]}
        {...{ progress }}
      />
    ),
    useTheme: () => ({
      colors: {
        error: '#ff0000',
        onSurface: '#000000',
      },
    }),
  };
});

describe('PasswordStrengthIndicator', () => {
  const renderWithShow = (password: string, show = true) =>
    render(<PasswordStrengthIndicator password={password} show={show} />);

  describe('Rendering', () => {
    it('should not render when show is false', () => {
      const { queryByTestId } = renderWithShow("test", false);
      expect(queryByTestId('progress-bar')).toBeNull();
    });

    it('should not render for empty password', () => {
      const { queryByTestId } = renderWithShow("");
      expect(queryByTestId('progress-bar')).toBeNull();
    });

    it('should render progress bar for non-empty password', () => {
      const { getByTestId } = renderWithShow("weak");
      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show strength label', () => {
      const { getByText } = renderWithShow("TestPass123!");
      expect(
        getByText(/molto debole|debole|discreta|forte|molto forte/i)
      ).toBeTruthy();
    });
  });

  describe('Strength levels', () => {
    it('should show "Molto Debole" for very weak passwords', () => {
      const { getByText } = renderWithShow("123");
      expect(getByText('Molto Debole')).toBeTruthy();
    });

    it('should show higher strength for complex password', () => {
      const { getByText } = renderWithShow("MyStr0ng!P@ssw0rd");
      expect(getByText(/forte|molto forte/i)).toBeTruthy();
    });

    it('should show maximum strength for very strong password', () => {
      const { getByText } = renderWithShow("C0mpl3x!P@ssw0rd#2024$Secure");
      expect(getByText('Molto Forte')).toBeTruthy();
    });
  });

  describe('Progress bar visual', () => {
    it('should have low progress for weak password', () => {
      const { getByTestId } = renderWithShow("abc");
      const progressBar = getByTestId('progress-bar');
      const progress = progressBar.props.progress;
      expect(progress).toBeLessThan(0.4);
    });

    it('should have high progress for strong password', () => {
      const { getByTestId } = renderWithShow("MyStr0ng!P@ssw0rd#2024");
      const progressBar = getByTestId('progress-bar');
      const progress = progressBar.props.progress;
      expect(progress).toBeGreaterThan(0.6);
    });

    it('should have full progress for very strong password', () => {
      const { getByTestId } = renderWithShow("V3ry!C0mpl3x#P@ssw0rd$2024&Secure*123");
      const progressBar = getByTestId('progress-bar');
      const progress = progressBar.props.progress;
      expect(progress).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('Suggestions', () => {
    it('should show suggestions for weak passwords', () => {
      const { getByText } = renderWithShow("weak");
      expect(getByText(/aggiung|usa|includi|caratteri/i)).toBeTruthy();
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
      const { queryByTestId } = renderWithShow("");
      expect(queryByTestId('progress-bar')).toBeNull();
    });

    it('should handle whitespace-only password', () => {
      const { getByText } = renderWithShow("   ");
      expect(getByText('Molto Debole')).toBeTruthy();
    });

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(100) + '1!';
      const { getByTestId } = renderWithShow(longPassword);
      expect(getByTestId('progress-bar')).toBeTruthy();
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
      const { rerender, queryByTestId } = renderWithShow("test123");
      expect(queryByTestId('progress-bar')).toBeTruthy();
      
      rerender(<PasswordStrengthIndicator password="" show={true} />);
      expect(queryByTestId('progress-bar')).toBeNull();
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
