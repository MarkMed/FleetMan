/**
 * Auth utilities for handling authentication state transitions
 */

export interface AuthTransitionState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  hasToken: boolean;
  hasUser: boolean;
}

/**
 * Determines if the auth state is in a valid "ready" state
 * to prevent flickering during transitions
 */
export const isAuthStateReady = (state: AuthTransitionState): boolean => {
  // Not ready if not hydrated yet
  if (!state.isHydrated) {
    return false;
  }

  // Ready if we have a complete auth state (authenticated with user data)
  if (state.isAuthenticated && state.hasUser && !state.isLoading) {
    return true;
  }

  // Ready if we're clearly not authenticated (no token, no user)
  if (!state.isAuthenticated && !state.hasToken && !state.hasUser && !state.isLoading) {
    return true;
  }

  // Not ready if we're in an intermediate state (has token but loading user)
  if (state.hasToken && !state.hasUser && state.isLoading) {
    return false;
  }

  // Default to ready if hydrated and not loading
  return state.isHydrated && !state.isLoading;
};

/**
 * Determines if a navigation action is safe to perform
 */
export const canNavigate = (state: AuthTransitionState): boolean => {
  return isAuthStateReady(state);
};

/**
 * Gets the appropriate loading message based on auth state
 */
export const getLoadingMessage = (state: AuthTransitionState): string => {
  if (!state.isHydrated) {
    return 'Cargando aplicación...';
  }

  if (state.isLoading && state.hasToken && !state.hasUser) {
    return 'Verificando sesión...';
  }

  if (state.isLoading) {
    return 'Procesando...';
  }

  return 'Cargando...';
};