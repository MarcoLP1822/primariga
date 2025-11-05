import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorMessage } from '../../../../src/presentation/components/ErrorMessage';

describe('ErrorMessage Component', () => {
  const defaultProps = {
    message: 'Si è verificato un errore',
  };

  it('should render error message correctly', () => {
    // Arrange & Act
    render(<ErrorMessage {...defaultProps} />);

    // Assert
    const errorText = screen.getByText('Si è verificato un errore');
    expect(errorText).toBeTruthy();
  });

  it('should call onRetry when retry button is pressed', () => {
    // Arrange
    const mockRetry = jest.fn();
    render(<ErrorMessage {...defaultProps} onRetry={mockRetry} />);

    // Act
    const retryButton = screen.getByText('Riprova');
    fireEvent.press(retryButton);

    // Assert
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when onRetry is not provided', () => {
    // Arrange & Act
    render(<ErrorMessage {...defaultProps} />);

    // Assert
    const retryButton = screen.queryByText('Riprova');
    expect(retryButton).toBeNull();
  });

  it('should render with custom message', () => {
    // Arrange & Act
    render(<ErrorMessage message="Dettagli dell'errore specifico" />);

    // Assert
    const errorMessage = screen.getByText("Dettagli dell'errore specifico");
    expect(errorMessage).toBeTruthy();
  });
});
