import { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/slices/authSlice';
import { useLogout } from '@hooks/useAuth';
import { modal } from '@helpers/modal';
import { BodyText, Button, Modal } from '@components/ui';
import { ROUTES } from '@constants';

/**
 * Sprint #14 Task 14.10: Mini Perfil en Navbar
 * 
 * Botón de perfil de usuario en la esquina superior derecha del NavBar.
 * Muestra avatar + nombre del usuario (desktop/tablet only).
 * Al hacer click, abre modal con opciones de perfil.
 * 
 * Features:
 * - Avatar placeholder con primera letra del email o icono por defecto
 * - Nombre de la compañía si existe, sino email truncado
 * - Modal con 3 opciones: Ver Perfil, Editar Perfil, Cerrar Sesión
 * - Responsive: nombre visible en desktop, solo avatar en tablet
 * 
 * Dependencias:
 * - Reusa sistema de modales global (modalSlice + modal.show())
 * - Integra con useLogout hook existente
 * - Navega a rutas de perfil con react-router
 */

/**
 * Sprint #14 Task 14.10: Mini Perfil en Navbar
 * 
 * Botón de perfil de usuario en la esquina superior derecha del NavBar.
 * Muestra avatar + nombre del usuario (desktop/tablet only).
 * Al hacer click, abre modal con opciones de perfil.
 * 
 * Features:
 * - Avatar placeholder con primera letra del email o icono por defecto
 * - Nombre de la compañía si existe, sino email truncado
 * - Modal con 3 opciones: Ver Perfil, Editar Perfil, Cerrar Sesión
 * - Responsive: nombre visible en desktop, solo avatar en tablet
 * 
 * Architecture:
 * - Usa Modal component directamente (patrón de ChatOptionsModal)
 * - Estructura consistente: Icon + Title + Description
 * - Integra con useLogout hook existente
 * - Navega a rutas de perfil con react-router
 */

/**
 * Componente principal: Botón de perfil de usuario para el NavBar
 */
export function UserProfileButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  
  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!user) return null;

  // Extract user display name and email
  const userName = user.profile?.companyName || user.email.split('@')[0];
  const userEmail = user.email;
  
  // Avatar fallback: primera letra del email en mayúscula
  const avatarLetter = user.email[0].toUpperCase();

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
   * Cierra el modal de perfil y muestra modal de confirmación
   */
  const handleLogout = () => {
    setIsProfileModalOpen(false);
    
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

  return (
    <>
      <button
        onClick={handleOpenProfileMenu}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Perfil de usuario"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          {avatarLetter}
        </div>
        
        {/* User name - Hidden on mobile, visible on desktop */}
        <span className="hidden md:inline-block text-sm font-medium text-gray-700 max-w-[150px] truncate">
          {userName}
        </span>
      </button>

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
            className="h-auto py-4 px-4 justify-start text-left hover:bg-accent"
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
            className="h-auto py-4 px-4 justify-start text-left hover:bg-accent"
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
            onPress={handleLogout}
            className="h-auto py-4 px-4 justify-start text-left text-destructive hover:text-destructive hover:bg-destructive/10 border border-red-600"
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
