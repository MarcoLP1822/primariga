import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User Slice - Gestisce lo stato dell'utente
 */
interface UserState {
  userId: string | null;
  isAuthenticated: boolean;
  setUser: (userId: string | null) => void;
  logout: () => void;
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
    (set) => ({
      // User State
      userId: null,
      isAuthenticated: false,
      setUser: (userId) => set({ userId, isAuthenticated: userId !== null }),
      logout: () => set({ userId: null, isAuthenticated: false }),

      // UI State
      selectedGenres: [],
      selectedLanguage: 'it',
      setGenres: (genres) => set({ selectedGenres: genres }),
      setLanguage: (language) => set({ selectedLanguage: language }),
      resetFilters: () => set({ selectedGenres: [], selectedLanguage: 'it' }),

      // Seen Books (tracciamento per statistiche, i libri possono essere rivisti)
      seenBookIds: [],
      addSeenBook: (bookId) =>
        set((state) => {
          // Aggiungi solo se non è già presente (per conteggio accurato)
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
      // Persisti solo alcune parti dello store
      partialize: (state) => ({
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        selectedGenres: state.selectedGenres,
        selectedLanguage: state.selectedLanguage,
        // NON persistiamo seenBookIds (si resetta ad ogni apertura app)
      }),
    }
  )
);
