import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAppStore } from '../../../../src/infrastructure/store/store';
import { AuthService } from '../../../../src/infrastructure/auth';
import { supabase } from '../../../../src/data/supabaseClient';
import { queryClient } from '../../../../src/infrastructure/config/queryClient';
import type { Session, User } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('../../../../src/infrastructure/auth');
jest.mock('../../../../src/data/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));
jest.mock('../../../../src/infrastructure/config/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Auth Store', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockProfile = {
    id: 'user-123',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    role: 'user' as const, // Add role field
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useAppStore.setState({
      userId: null,
      session: null,
      isAuthenticated: false,
      isAnonymous: true,
      profile: null,
      selectedGenres: [],
      selectedLanguage: 'it',
      seenBookIds: [],
    });
  });

  describe('Initial State', () => {
    it('should have anonymous user state by default', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.userId).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
      expect(result.current.profile).toBeNull();
    });
  });

  describe('setSession', () => {
    it('should set session and fetch profile successfully', async () => {
      // Mock profile fetch
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.setSession(mockSession);
      });

      await waitFor(() => {
        expect(result.current.userId).toBe('user-123');
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAnonymous).toBe(false);
        expect(result.current.profile).toEqual({
          id: 'user-123',
          username: 'testuser',
          fullName: 'Test User',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'Test bio',
          role: 'user',
        });
      });
    });

    it('should handle null session by clearing user state', async () => {
      const { result } = renderHook(() => useAppStore());

      // First set a session
      await act(async () => {
        await result.current.setSession(mockSession);
      });

      // Then clear it
      await act(async () => {
        await result.current.setSession(null);
      });

      expect(result.current.userId).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
      expect(result.current.profile).toBeNull();
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['likedBooks'],
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['isBookLiked'],
      });
    });

    it('should handle profile fetch error gracefully', async () => {
      // Mock profile fetch error
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Profile not found' },
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.setSession(mockSession);
      });

      await waitFor(() => {
        expect(result.current.userId).toBe('user-123');
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.profile).toBeNull(); // Profile fetch failed but auth still works
      });
    });
  });

  describe('setUser', () => {
    it('should set user and fetch profile', async () => {
      // Mock profile fetch
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.setUser('user-123');
      });

      await waitFor(() => {
        expect(result.current.userId).toBe('user-123');
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAnonymous).toBe(false);
        expect(result.current.profile).toBeDefined();
      });
    });

    it('should clear user state when userId is null', async () => {
      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.setUser(null);
      });

      expect(result.current.userId).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all user state and reset UI', async () => {
      (AuthService.signOut as jest.Mock).mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useAppStore());

      // Set some state first
      await act(async () => {
        result.current.setGenres(['Fiction', 'Mystery']);
        result.current.setLanguage('en');
        result.current.addSeenBook('book-1');
        await result.current.setSession(mockSession);
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(AuthService.signOut).toHaveBeenCalled();
      expect(result.current.userId).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
      expect(result.current.profile).toBeNull();
      expect(result.current.selectedGenres).toEqual([]);
      expect(result.current.selectedLanguage).toBe('it');
      expect(result.current.seenBookIds).toEqual([]);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['likedBooks'],
      });
    });
  });

  describe('refreshProfile', () => {
    it('should refresh profile data', async () => {
      const updatedProfile = {
        ...mockProfile,
        username: 'updateduser',
        full_name: 'Updated User',
      };

      // Mock profile fetch
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: updatedProfile,
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useAppStore());

      // Set initial user
      await act(async () => {
        useAppStore.setState({ userId: 'user-123' });
      });

      // Refresh profile
      await act(async () => {
        await result.current.refreshProfile();
      });

      await waitFor(() => {
        expect(result.current.profile).toEqual({
          id: 'user-123',
          username: 'updateduser',
          fullName: 'Updated User',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'Test bio',
          role: 'user',
        });
      });
    });

    it('should do nothing if no userId', async () => {
      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should load session on app start if valid session exists', async () => {
      (AuthService.getSession as jest.Mock).mockResolvedValue(mockSession);

      // Mock profile fetch
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(AuthService.getSession).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.userId).toBe('user-123');
      });
    });

    it('should set anonymous state if no valid session', async () => {
      (AuthService.getSession as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAnonymous).toBe(true);
        expect(queryClient.invalidateQueries).toHaveBeenCalled();
      });
    });

    it('should handle initialization errors gracefully', async () => {
      (AuthService.getSession as jest.Mock).mockRejectedValue(
        new Error('Session error')
      );

      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAnonymous).toBe(true);
      });
    });
  });

  describe('requiresAuth', () => {
    it('should return true when not authenticated', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.requiresAuth()).toBe(true);
    });

    it('should return false when authenticated', async () => {
      const { result } = renderHook(() => useAppStore());

      await act(async () => {
        useAppStore.setState({ isAuthenticated: true });
      });

      expect(result.current.requiresAuth()).toBe(false);
    });
  });

  describe('UI State', () => {
    it('should manage genre filters', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setGenres(['Fiction', 'Mystery']);
      });

      expect(result.current.selectedGenres).toEqual(['Fiction', 'Mystery']);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.selectedGenres).toEqual([]);
    });

    it('should manage language selection', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.selectedLanguage).toBe('en');
    });

    it('should manage seen books', () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addSeenBook('book-1');
        result.current.addSeenBook('book-2');
        result.current.addSeenBook('book-1'); // Duplicate
      });

      expect(result.current.seenBookIds).toEqual(['book-1', 'book-2']);

      act(() => {
        result.current.clearSeenBooks();
      });

      expect(result.current.seenBookIds).toEqual([]);
    });
  });
});
