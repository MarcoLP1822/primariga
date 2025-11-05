import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../../../../src/presentation/components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render correctly', () => {
    // Arrange & Act
    const { UNSAFE_getByType } = render(<LoadingSpinner />);

    // Assert - Component renders without crashing
    expect(UNSAFE_getByType(LoadingSpinner)).toBeTruthy();
  });

  it('should render with custom size', () => {
    // Arrange & Act
    const { UNSAFE_getByType } = render(<LoadingSpinner size="small" />);

    // Assert - Component renders without crashing with custom size
    expect(UNSAFE_getByType(LoadingSpinner)).toBeTruthy();
  });

  it('should render with custom color', () => {
    // Arrange & Act
    const { UNSAFE_getByType } = render(<LoadingSpinner color="#FF0000" />);

    // Assert
    expect(UNSAFE_getByType(LoadingSpinner)).toBeTruthy();
  });
});
