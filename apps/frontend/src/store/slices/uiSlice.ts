import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIState } from '@models';
import { STORAGE_KEYS, THEMES, LANGUAGES } from '@constants';

interface UIStore extends UIState {
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'es' | 'en') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      theme: 'system',
      language: 'es',

      // Actions
      toggleSidebar: () => {
        const currentState = get();
        set({ sidebarCollapsed: !currentState.sidebarCollapsed });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },

      setLanguage: (language: 'es' | 'en') => {
        set({ language });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);