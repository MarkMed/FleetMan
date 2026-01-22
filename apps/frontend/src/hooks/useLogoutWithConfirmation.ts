import { useTranslation } from 'react-i18next';
import { useLogout } from './useAuth';
import { modal } from '@helpers/modal';

/**
 * useLogoutWithConfirmation Hook
 * 
 * Sprint #14 Task 14.10 - Extracted logout logic
 * 
 * Purpose:
 * - Centralize logout confirmation logic
 * - Avoid duplication between UserProfileButton and NavigationDrawer
 * - Provide consistent logout UX across the app
 * 
 * Features:
 * - Confirmation modal with warning variant
 * - Loading state during logout
 * - Success/error feedback
 * - i18n support
 * 
 * @returns handleLogout function to trigger logout flow
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const handleLogout = useLogoutWithConfirmation();
 *   
 *   return (
 *     <Button onPress={handleLogout}>
 *       Cerrar Sesión
 *     </Button>
 *   );
 * }
 * ```
 */
export function useLogoutWithConfirmation() {
  const { t } = useTranslation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    modal.confirm({
      title: t('profile.menu.logoutConfirm.title'),
      content: t('profile.menu.logoutConfirm.message'),
      action: 'warning',
      confirmText: t('profile.menu.logoutConfirm.confirm'),
      cancelText: t('profile.menu.logoutConfirm.cancel'),
      onConfirm: async () => {
        try {
          modal.showLoading(t('profile.menu.logoutLoading'));
          await logoutMutation.mutateAsync();
          modal.success({
            title: t('profile.menu.logoutSuccess.title'),
            description: t('profile.menu.logoutSuccess.message')
          });
          // Redirect handled by auth store
        } catch (error) {
          modal.error({
            title: t('profile.menu.logoutError.title'),
            description: t('profile.menu.logoutError.message')
          });
          console.error('Logout error:', error);
        }
      }
    });
  };

  return handleLogout;
}
