import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../auth';
import { supabase } from '../../data/supabaseClient';
import { queryClient } from '../config/queryClient';
import { analytics } from '../analytics';

/**
 * User Profile Type
 */
interface UserProfile {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

/**
 * User Slice - Gestisce lo stato dell'utente con Supabase Auth
 * 
 * IMPORTANT: L'app supporta utilizzo anonimo (senza account).
 * L'autenticazione è richiesta SOLO per azioni che salvano dati persistenti:
 * - Salvare preferiti (likes)
 * - Modificare profilo
 * - Sincronizzare reading history
 * 
 * Browsing, visualizzazione libri e lettura prime righe sono SEMPRE permessi.
 */
interface UserState {
  // Auth State
  userId: string | null;
  session: Session | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;

  // Anonymous user support
  isAnonymous: boolean; // true se utente non ha mai fatto login

  // Actions
  setUser: (userId: string | null) => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Helper per check auth requirement
  requiresAuth: () => boolean;
}

/**
 * UI Slice - Gestisce lo stato dell'interfaccia utente
 */
interface UIState {
  // Filtri per la home
  selectedGenres: string[];
  selectedLanguage: string;
  setGenres: (genres: string[]) => void;
  setLanguage: (language: string) => void;
  resetFilters: () => void;

  // Libri visti (solo per statistiche, non esclude dalla rotazione)
  seenBookIds: string[];
  addSeenBook: (bookId: string) => void;
  clearSeenBooks: () => void;
}

/**
 * Store Type completo
 */
type AppStore = UserState & UIState;

/**
 * Store principale dell'applicazione (persistito in AsyncStorage)
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // =====================================================
      // USER STATE
      // =====================================================
      userId: null,
      session: null,
      isAuthenticated: false,
      isAnonymous: true, // Default: user inizia come anonimo
      profile: null,

      // Set user by ID and fetch profile
      setUser: async (userId: string | null) => {
        if (!userId) {
          set({
            userId: null,
            session: null,
            isAuthenticated: false,
            isAnonymous: true,
            profile: null,
          });
          return;
        }

        // Fetch user profile from database
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .eq('id', userId)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileData = data as any; // Type workaround for Supabase generated types

          if (!error && profileData) {
            set({
              userId,
              isAuthenticated: true,
              isAnonymous: false,
              profile: {
                id: profileData.id,
                username: profileData.username || null,
                fullName: profileData.full_name || null,
                avatarUrl: profileData.avatar_url || null,
                bio: profileData.bio || null,
              },
            });
          } else {
            // Profile not found, still set userId
            set({
              userId,
              isAuthenticated: true,
              isAnonymous: false,
              profile: null,
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({
            userId,
            isAuthenticated: true,
            isAnonymous: false,
            profile: null,
          });
        }
      },

      // Set session and extract user info
      setSession: async (session: Session | null) => {
        if (!session) {
          set({
            userId: null,
            session: null,
            isAuthenticated: false,
            isAnonymous: true,
            profile: null,
          });
          
          // IMPORTANT: Invalida cache React Query per likes quando user diventa anonimo
          // Questo previene che utenti anonimi vedano likes salvati da sessioni precedenti
          queryClient.invalidateQueries({ queryKey: ['likedBooks'] });
          queryClient.invalidateQueries({ queryKey: ['isBookLiked'] });
          
          return;
        }

        const userId = session.user.id;

        // Fetch profile
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .eq('id', userId)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileData = data as any; // Type workaround for Supabase generated types

          if (!error && profileData) {
            const profile = {
              id: profileData.id,
              username: profileData.username || null,
              fullName: profileData.full_name || null,
              avatarUrl: profileData.avatar_url || null,
              bio: profileData.bio || null,
            };
            
            set({
              userId,
              session,
              isAuthenticated: true,
              isAnonymous: false,
              profile,
            });
            
            // Identify user in analytics
            analytics.identify(userId, {
              email: session.user.email,
              username: profile.username || undefined,
              full_name: profile.fullName || undefined,
              auth_method: 'email', // può essere esteso per OAuth
            });
          } else {
            set({
              userId,
              session,
              isAuthenticated: true,
              isAnonymous: false,
              profile: null,
            });
            
            // Identify user in analytics (even without profile)
            analytics.identify(userId, {
              email: session.user.email,
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({
            userId,
            session,
            isAuthenticated: true,
            isAnonymous: false,
            profile: null,
          });
          
          // Identify user in analytics (even on error)
          analytics.identify(userId, {
            email: session.user.email,
          });
        }
      },

      // Logout
      logout: async () => {
        await AuthService.signOut();
        
        // Reset analytics state
        analytics.reset();
        
        set({
          userId: null,
          session: null,
          isAuthenticated: false,
          isAnonymous: true, // Torna anonimo dopo logout
          profile: null,
          // Reset UI state
          selectedGenres: [],
          selectedLanguage: 'it',
          seenBookIds: [],
        });
        
        // IMPORTANT: Invalida cache React Query per likes quando user fa logout
        queryClient.invalidateQueries({ queryKey: ['likedBooks'] });
        queryClient.invalidateQueries({ queryKey: ['isBookLiked'] });
      },

      // Refresh profile from database
      refreshProfile: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, bio')
            .eq('id', userId)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profileData = data as any; // Type workaround for Supabase generated types

          if (!error && profileData) {
            set({
              profile: {
                id: profileData.id,
                username: profileData.username || null,
                fullName: profileData.full_name || null,
                avatarUrl: profileData.avatar_url || null,
                bio: profileData.bio || null,
              },
            });
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      },

      // Initialize - Check for existing session on app start
      initialize: async () => {
        try {
          const session = await AuthService.getSession();
          if (session) {
            // Valid session found - load user data
            await get().setSession(session);
          } else {
            // No valid session - clear stored data and set anonymous
            set({ 
              userId: null,
              session: null,
              isAuthenticated: false,
              isAnonymous: true,
              profile: null,
            });
            
            // IMPORTANT: Clear React Query cache for likes
            // This prevents showing old likes from previous sessions
            queryClient.invalidateQueries({ queryKey: ['likedBooks'] });
            queryClient.invalidateQueries({ queryKey: ['isBookLiked'] });
          }
        } catch (error) {
          console.error('Error during initialization:', error);
          // On error, default to anonymous state
          set({ 
            userId: null,
            session: null,
            isAuthenticated: false,
            isAnonymous: true,
            profile: null,
          });
          queryClient.invalidateQueries({ queryKey: ['likedBooks'] });
          queryClient.invalidateQueries({ queryKey: ['isBookLiked'] });
        }
      },

      // Helper: Check if current action requires authentication
      requiresAuth: () => {
        const { isAuthenticated } = get();
        return !isAuthenticated;
      },

      // =====================================================
      // UI STATE
      // =====================================================
      selectedGenres: [],
      selectedLanguage: 'it',
      setGenres: (genres) => set({ selectedGenres: genres }),
      setLanguage: (language) => set({ selectedLanguage: language }),
      resetFilters: () => set({ selectedGenres: [], selectedLanguage: 'it' }),

      // =====================================================
      // SEEN BOOKS
      // =====================================================
      seenBookIds: [],
      addSeenBook: (bookId) =>
        set((state) => {
          if (state.seenBookIds.includes(bookId)) {
            return state;
          }
          return {
            seenBookIds: [...state.seenBookIds, bookId],
          };
        }),
      clearSeenBooks: () => set({ seenBookIds: [] }),
    }),
    {
      name: 'primariga-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persisti solo UI preferences, NON auth state
      // Auth state viene gestito completamente da Supabase e verificato ad ogni avvio
      partialize: (state) => ({
        // UI Preferences
        selectedGenres: state.selectedGenres,
        selectedLanguage: state.selectedLanguage,
        seenBookIds: state.seenBookIds,
        
        // NON persistiamo auth state:
        // - userId: verificato da Supabase session
        // - session: gestita da Supabase
        // - isAuthenticated: derivato da session
        // - isAnonymous: derivato da session
        // - profile: re-fetched all'avvio se session valida
      }),
    }
  )
);
