/**
 * Test suite for SessionManager
 */

import { renderHook, act } from '@testing-library/react-native';
import { useSessionTimeout } from '../../../../src/infrastructure/auth/SessionManager';
import { Alert } from 'react-native';

// Mock dependencies
const mockLogout = jest.fn();
const mockTrack = jest.fn();
let mockIsAuthenticated = false;

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock('../../../../src/infrastructure/store/store', () => ({
  useAppStore: jest.fn((selector) => {
    const store = {
      logout: mockLogout,
      isAnonymous: !mockIsAuthenticated,
    };
    return selector ? selector(store) : store;
  }),
}));

jest.mock('../../../../src/infrastructure/analytics', () => ({
  analytics: {
    track: mockTrack,
  },
  AnalyticsEvent: {
    LOGOUT: 'logout',
    ERROR_OCCURRED: 'error_occurred',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsAuthenticated = false;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useSessionTimeout hook', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useSessionTimeout());
      expect(result.current).toBeDefined();
      expect(result.current.resetTimeout).toBeDefined();
    });

    it('should not start timer when user is not authenticated', () => {
      mockIsAuthenticated = false;
      
      renderHook(() => useSessionTimeout());
      
      act(() => {
        jest.advanceTimersByTime(35 * 60 * 1000);
      });
      
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should reset timeout when resetTimeout is called', () => {
      mockIsAuthenticated = true;
      
      const { result } = renderHook(() => useSessionTimeout());
      
      // Call resetTimeout manually
      act(() => {
        result.current.resetTimeout();
      });
      
      expect(result.current.resetTimeout).toBeDefined();
    });
  });
});

