import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthProvider';
import { ROUTES } from '../constants';

/**
 * Hook para manejar navegación automática basada en estado de autenticación
 * - Redirige a dashboard cuando el usuario se autentica
 * - Redirige a login cuando el usuario se desautentica
 * - Evita loops infinitos de redirección
 */
export const useNavigateOnAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Don't navigate while authentication is loading
    if (isLoading) return;

    const currentPath = location.pathname;
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      ROUTES.AUTH.LOGIN,
      ROUTES.AUTH.REGISTER,
      ROUTES.AUTH.FORGOT_PASSWORD,
    ];

    // Define private routes that require authentication
    const isOnPublicRoute = publicRoutes.includes(currentPath as any);
    const isOnAuthRoute = currentPath.startsWith('/auth');

    if (isAuthenticated && isOnPublicRoute) {
      // User is authenticated but on a public route → redirect to dashboard
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else if (!isAuthenticated && !isOnAuthRoute && currentPath !== '/') {
      // User is not authenticated and on a private route → redirect to login
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);
};

/**
 * Hook para obtener la URL de redirección después del login
 * Útil para redirigir al usuario a la página que estaba intentando acceder
 */
export const useRedirectAfterLogin = () => {
  const location = useLocation();
  
  // Get the intended destination from location state or default to dashboard
  const getRedirectPath = (): string => {
    const state = location.state as { from?: { pathname: string } } | null;
    const from = state?.from?.pathname;
    
    // Don't redirect to auth routes
    if (from && !from.startsWith('/auth')) {
      return from;
    }
    
    return ROUTES.DASHBOARD;
  };

  return { getRedirectPath };
};