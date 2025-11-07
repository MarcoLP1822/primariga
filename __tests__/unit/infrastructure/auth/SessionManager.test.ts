/**
 * Test suite for SessionManager
 */

import { renderHook, act } from '@testing-library/react-native';
import { useSessionTimeout } from '../../../../src/infrastructure/auth/SessionManager';
import { Alert } from 'react-native';

// Mock dependencies
const mockReplace = jest.fn();
const mockClearAuth = jest.fn();
const mockTrack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('../../../../src/infrastructure/store/store', () => ({
  useAppStore: () => ({
    user: null,
    clearAuth: mockClearAuth,
  }),
}));

jest.mock('../../../../src/infrastructure/analytics', () => ({
  analytics: {
    track: mockTrack,
  },
  AnalyticsEvent: {
    SESSION_TIMEOUT: 'session_timeout',
    SESSION_WARNING: 'session_warning',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useSessionTimeout hook', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useSessionTimeout());
      expect(result.current).toBeDefined();
    });

    it('should track warning and timeout events', () => {
      renderHook(() => useSessionTimeout());
      
      // Fast-forward to warning time (25 minutes)
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });
      
      expect(mockTrack).toHaveBeenCalledWith(
        'session_warning',
        expect.any(Object)
      );
      
      // Clear and go to timeout
      mockTrack.mockClear();
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });
      
      expect(mockTrack).toHaveBeenCalledWith(
        'session_timeout',
        expect.any(Object)
      );
    });

    it('should logout after 30 minutes', () => {
      renderHook(() => useSessionTimeout());
      
      act(() => {
        jest.advanceTimersByTime(30 * 60 * 1000);
      });
      
      expect(mockClearAuth).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});

