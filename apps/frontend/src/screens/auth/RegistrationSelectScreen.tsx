import React, { useEffect } from 'react';
import { RegistrationModeModal } from './FullRegistration/RegistrationModeModal';
import { useNavigate } from 'react-router-dom';

/**
 * RegistrationSelectScreen - Sprint #14 Task 2.1b
 * 
 * Pantalla intermedia que muestra el modal de selección de modo de registro.
 * Si el modal se cierra sin seleccionar, redirige a login.
 * 
 * Routes:
 * - /auth/register -> redirige aquí
 * - /auth/register/select -> esta pantalla
 * - Modal selecciona: /auth/register/quick O /auth/register/complete
 */
export const RegistrationSelectScreen: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  // Auto-open modal on mount
  useEffect(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Si cierra el modal sin seleccionar, redirige a login
    if (!isOpen) {
      navigate('/auth/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <RegistrationModeModal open={open} onOpenChange={handleOpenChange} />
    </div>
  );
};
