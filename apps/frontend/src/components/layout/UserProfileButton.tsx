import { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/slices/authSlice';
import { useLogoutWithConfirmation } from '@hooks/useLogoutWithConfirmation';
import { BodyText, Button, Modal } from '@components/ui';
import { ROUTES } from '@constants';
import { getAvatarLetter, getUserDisplayName } from '@utils/userHelpers';

/**
 * Sprint #14 Task 14.10: Mini Perfil en Navbar
 * 
 * Botón de perfil de usuario en la esquina superior derecha del NavBar.
 * Muestra avatar + nombre del usuario (desktop/tablet only).
 * Al hacer click, abre modal con opciones de perfil.
 * 
 * Features:
 * - Avatar placeholder con primera letra del email (con fallback a '?')
 * - Nombre de la compañía si existe, sino email username
 * - Modal con estructura consistente: Icon + Title + Description (patrón de ChatOptionsModal)
 * - Opciones: Ver Perfil, Editar Perfil, Cerrar Sesión
 * - Responsive: nombre visible en desktop, solo avatar en tablet
 * - Theme-aware: Usa tokens del theme (bg-primary, text-destructive)
 * 
 * Architecture:
 * - Usa Modal component directamente (no modal.show())
 * - Reusa useLogoutWithConfirmation hook (shared con NavigationDrawer)
 * - Reusa userHelpers utilities (getAvatarLetter, getUserDisplayName)
 * - Integra con react-router para navegación
 */

/**
 * Componente principal: Botón de perfil de usuario para el NavBar
 */
export function UserProfileButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const handleLogout = useLogoutWithConfirmation();
  
  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!user) return null;

  // Extract user display info using centralized utilities
  const userName = getUserDisplayName(user);
  const userEmail = user.email;
  const avatarLetter = getAvatarLetter(user.email);

  /**
   * Handler: Abre modal con opciones de perfil
   */
  const handleOpenProfileMenu = () => {
    setIsProfileModalOpen(true);
  };

  /**
   * Handler: Navegar a Ver Perfil
   */
  const handleNavigateToProfile = () => {
    setIsProfileModalOpen(false);
    navigate(ROUTES.PROFILE);
  };

  /**
   * Handler: Navegar a Editar Perfil
   */
  const handleNavigateToEditProfile = () => {
    setIsProfileModalOpen(false);
    navigate(`${ROUTES.PROFILE}/edit`);
  };

  /**
   * Handler: Logout con confirmación
   * Delegado al hook compartido useLogoutWithConfirmation
   */
  const handleLogoutClick = () => {
    setIsProfileModalOpen(false);
    handleLogout();
  };

  return (
    <>
      <Button
        variant="ghost"
        onPress={handleOpenProfileMenu}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--color-card))] hover:bg-gray-100 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100"
        aria-label={t('profile.menu.ariaLabel')}
      >
        {/* Avatar - Uses theme token bg-primary instead of hardcoded color */}
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {avatarLetter}
        </div>
        
        {/* User name - Hidden on mobile, visible on desktop */}
        <span className="hidden md:inline-block text-sm font-medium max-w-[150px] truncate">
          {userName}
        </span>
      </Button>

      {/* Profile Options Modal */}
      <Modal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        title={t('profile.menu.title')}
        showCloseButton={true}
      >
        <div className="flex flex-col gap-2 p-4">
          {/* User Info Header */}
          <div className="pb-3 mb-2 border-b border-border">
            <BodyText weight="medium" size="medium" className="text-foreground">
              {userName}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {userEmail}
            </BodyText>
          </div>

          {/* Ver Perfil Option */}
          <Button
            variant="outline"
            onPress={handleNavigateToProfile}
            className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))]"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="mt-0.5">
                <User className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <BodyText weight="medium" size="medium">
                  {t('profile.menu.viewProfile')}
                </BodyText>
                <BodyText size="regular" className="text-muted-foreground">
                  {t('profile.menu.viewProfileDesc')}
                </BodyText>
              </div>
            </div>
          </Button>

          {/* Editar Perfil Option */}
          <Button
            variant="outline"
            onPress={handleNavigateToEditProfile}
            className="h-auto py-4 px-4 justify-start text-left bg-[hsl(var(--color-card))]"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="mt-0.5">
                <Settings className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <BodyText weight="medium" size="medium">
                  {t('profile.menu.editProfile')}
                </BodyText>
                <BodyText size="regular" className="text-muted-foreground">
                  {t('profile.menu.editProfileDesc')}
                </BodyText>
              </div>
            </div>
          </Button>

          {/* Cerrar Sesión Option (destructive at bottom) */}
          <Button
            variant="outline"
            onPress={handleLogoutClick}
            className="h-auto py-4 px-4 justify-start text-destructive border border-red-600 bg-destructive/5 hover:bg-destructive/20"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="mt-0.5">
                <LogOut className="h-7 w-7 text-destructive" />
              </div>
              <div className="flex flex-col">
                <BodyText weight="medium" size="medium" className="text-destructive">
                  {t('profile.menu.logout')}
                </BodyText>
                <BodyText size="regular" className="text-destructive/80">
                  {t('profile.menu.logoutDesc')}
                </BodyText>
              </div>
            </div>
          </Button>
        </div>
      </Modal>
    </>
  );
}

// TODO: Strategic features for future enhancements
// - Avatar image support (integrate with Cloudinary)
// - Status indicator (online/offline dot on avatar)
// - Notification badge (unread messages count)
// - Keyboard shortcuts (Alt+P to open profile menu)
// - Recent activity section in modal (last login, recent actions)
// - Quick settings toggle (theme, language) without navigating
