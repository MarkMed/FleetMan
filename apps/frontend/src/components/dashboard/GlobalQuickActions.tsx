import React from 'react';
import { useQuickActions } from '@hooks/useQuickActions';
import { QuickActionsButton } from './QuickActionsButton';
import { QuickActionsModal } from './QuickActionsModal';
import { MachineSelectModal } from './MachineSelectModal';
import { ContactSelectModal } from './ContactSelectModal';

/**
 * GlobalQuickActions - Sistema global de acciones rápidas
 * 
 * Componente que encapsula todo el sistema QuickActions:
 * - Float Action Button (FAB)
 * - Modal de acciones
 * - Modal de selección de máquinas
 * - Modal de selección de contactos
 * 
 * Sprint #14 Task 2.1c: QuickActions System
 * 
 * Este componente debe renderizarse en MainLayout para estar
 * disponible globalmente en toda la aplicación.
 * 
 * @example
 * ```tsx
 * // En MainLayout.tsx
 * <GlobalQuickActions />
 * ```
 */
export const GlobalQuickActions: React.FC = () => {
  const quickActions = useQuickActions();

  /**
   * Handler para volver atr\u00e1s desde modal de selecci\u00f3n a menu de acciones
   */
  const handleGoBackToActions = () => {
    quickActions.closeMachines();
    quickActions.closeContacts();
    quickActions.openActions();
  };

  return (
    <>
      {/* Float Action Button */}
      <QuickActionsButton onPress={quickActions.openActions} />

      {/* Actions Menu Modal */}
      <QuickActionsModal
        open={quickActions.isActionsOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeActions();
        }}
        onActionSelect={quickActions.handleActionSelect}
      />

      {/* Machine Selection Modal */}
      <MachineSelectModal
        open={quickActions.isMachinesOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeMachines();
        }}
        machines={quickActions.machines}
        onSelectMachine={quickActions.handleMachineSelect}
        actionType={quickActions.selectedAction}
        isLoading={quickActions.isLoadingMachines}
        onGoBack={handleGoBackToActions}
      />

      {/* Contact Selection Modal */}
      <ContactSelectModal
        open={quickActions.isContactsOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeContacts();
        }}
        contacts={quickActions.contacts}
        onSelectContact={quickActions.handleContactSelect}
        isLoading={quickActions.isLoadingContacts}
        onGoBack={handleGoBackToActions}
      />
    </>
  );
};
