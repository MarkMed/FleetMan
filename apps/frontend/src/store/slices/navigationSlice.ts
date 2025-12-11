import { create } from 'zustand';

interface NavigationState {
  isDrawerOpen: boolean;
  currentRoute: string;
}

interface NavigationActions {
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setCurrentRoute: (route: string) => void;
}

export type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>((set) => ({
  // State
  isDrawerOpen: false,
  currentRoute: '/',

  // Actions
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  
  openDrawer: () => set({ isDrawerOpen: true }),
  
  closeDrawer: () => set({ isDrawerOpen: false }),
  
  setCurrentRoute: (route: string) => set({ currentRoute: route }),
}));
