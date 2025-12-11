import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationStore } from '@store/slices';

/**
 * Hook para sincronizar la ruta actual con el store de navegación
 * Útil para tracking y analytics
 */
export const useNavigationSync = () => {
  const location = useLocation();
  const setCurrentRoute = useNavigationStore((state) => state.setCurrentRoute);

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);
};
