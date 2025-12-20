import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/AuthProvider';
import { useModalStore } from '../store/slices/modalSlice';

/**
 * Global Session Expired Handler Hook
 * 
 * Purpose:
 * - Listens for 'session-expired' custom events dispatched by apiClient
 * - Shows a modal informing the user their session has expired
 * - Executes logout and redirects to login on confirmation
 * 
 * Integration:
 * - Should be called once at app root level (App.tsx)
 * - Works in conjunction with apiClient 401 interceptor
 * 
 * Anti-spam:
 * - Modal only shown once per session (controlled by authStore flag)
 * - Won't show if user is already on login page
 * - Event listener automatically cleaned up on unmount
 */
export function useSessionExpiredHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { showModal, hideModal } = useModalStore();

  useEffect(() => {
    const handleSessionExpired = async () => {
      // Double-check we're not on login page (extra safety)
      if (location.pathname.includes('/auth/login')) {
        return;
      }

      // Show session expired modal
      showModal({
        mode: 'default',
        variant: 'warning',
        title: t('auth.sessionExpired.title'),
        description: t('auth.sessionExpired.description'),
        showCloseButton: false, // Force user to acknowledge
        dismissible: false, // Prevent closing by clicking overlay or ESC
        showConfirm: true,
        confirmText: t('auth.sessionExpired.action'),
        showCancel: false,
        onConfirm: async () => {
          try {
            // Execute logout logic (clears token, resets auth state)
            const result = await logout();
            
            // Close modal
            hideModal();
            
            // Navigate to login page
            if (result.shouldNavigate) {
              navigate('/auth/login', { replace: true });
            }
          } catch (error) {
            console.error('[SessionExpired] Error during logout:', error);
            // Still navigate to login even if logout API fails
            hideModal();
            navigate('/auth/login', { replace: true });
          }
        },
      });
    };

    // Listen for session expired events from apiClient
    window.addEventListener('session-expired', handleSessionExpired);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [location.pathname, logout, navigate, showModal, hideModal, t]);
}

// TODO: Future enhancements
// - Add telemetry/logging for session expiration events
// - Support custom redirect URL (pass via event detail)
// - Add option to show "Remember me" checkbox in modal
// - Integrate with refresh token flow (attempt refresh before showing modal)
