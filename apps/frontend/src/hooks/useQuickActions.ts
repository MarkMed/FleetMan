import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMachines } from './useMachines';
import { useMyContacts } from './useContacts';
import type { QuickActionId } from '../components/dashboard/QuickActionsModal';

/**
 * useQuickActions Hook
 * 
 * Hook personalizado que gestiona toda la lógica de negocio del sistema QuickActions.
 * Orquesta la interacción entre modales, maneja la navegación, y provee datos necesarios.
 * 
 * Sprint #14 Task 2.1c: QuickActions System
 * 
 * Responsabilidades:
 * - Gestionar estados de apertura/cierre de modales (actions, machines, contacts)
 * - Trackear acción seleccionada para navegación correcta
 * - Proveer datos de máquinas y contactos desde TanStack Query hooks
 * - Ejecutar navegación según el flujo: acción → selección → destino
 * 
 * Flujo típico:
 * 1. Usuario abre QuickActionsModal (openActions)
 * 2. Usuario selecciona acción (handleActionSelect)
 * 3. Hook determina si necesita machine/contact o navega directo
 * 4. Si necesita selección → abre modal correspondiente
 * 5. Usuario selecciona recurso (handleMachineSelect / handleContactSelect)
 * 6. Hook navega a la ruta construida
 * 
 * @example
 * ```tsx
 * const quickActions = useQuickActions();
 * 
 * <QuickActionsButton onPress={quickActions.openActions} />
 * <QuickActionsModal
 *   open={quickActions.isActionsOpen}
 *   onOpenChange={quickActions.setIsActionsOpen}
 *   onActionSelect={quickActions.handleActionSelect}
 * />
 * ```
 */
export function useQuickActions() {
  const navigate = useNavigate();

  // Fetch data from TanStack Query hooks
  const { data: machinesData, isLoading: isLoadingMachines } = useMachines();
  const { data: contactsData, isLoading: isLoadingContacts } = useMyContacts();

  // Modal states
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isMachinesOpen, setIsMachinesOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);

  // Track selected action for conditional navigation
  const [selectedAction, setSelectedAction] = useState<QuickActionId | null>(null);

  // Extract data from API responses
  const machines = machinesData?.machines ?? [];
  const contacts = contactsData?.contacts ?? [];

  /**
   * Handler: Usuario selecciona una acción en QuickActionsModal
   * 
   * Flujo de decisión:
   * - Si acción requiere máquina → Abre MachineSelectModal
   * - Si acción requiere contacto → Abre ContactSelectModal
   * - Si acción es directa → Navigate inmediatamente
   */
  const handleActionSelect = useCallback((actionId: QuickActionId) => {
    setSelectedAction(actionId);
    setIsActionsOpen(false); // Cerrar modal de acciones

    // Acciones que requieren selección de máquina
    if (['quickcheck', 'reportEvent', 'viewHistory'].includes(actionId)) {
      setIsMachinesOpen(true);
      return;
    }

    // Acción que requiere selección de contacto
    if (actionId === 'sendMessage') {
      setIsContactsOpen(true);
      return;
    }

    if (actionId === 'notifications') {
      navigate('/notifications');
      setSelectedAction(null);
      return;
    }
  }, [navigate]);

  /**
   * Handler: Usuario selecciona una máquina en MachineSelectModal
   * 
   * Construye la ruta según la acción previamente seleccionada
   * y navega al destino correspondiente.
   */
  const handleMachineSelect = useCallback((machineId: string) => {
    setIsMachinesOpen(false);

    // Construir ruta según acción seleccionada
    let targetRoute = '';
    
    switch (selectedAction) {
      case 'quickcheck':
        targetRoute = `/machines/${machineId}/quickcheck`;
        break;
      
      case 'reportEvent':
        targetRoute = `/machines/${machineId}/events`;
        break;
      
      case 'viewHistory':
        // Strategic decision: Por ahora redirigir a events
        // Future: Podría ser /quickcheck/history según contexto
        targetRoute = `/machines/${machineId}/events`;
        break;
      
      default:
        console.warn(`[useQuickActions] Unexpected action for machine selection: ${selectedAction}`);
        return;
    }

    navigate(targetRoute);
    setSelectedAction(null);
  }, [selectedAction, navigate]);

  /**
   * Handler: Usuario selecciona un contacto en ContactSelectModal
   * 
   * Navega al chat con el usuario seleccionado.
   */
  const handleContactSelect = useCallback((userId: string) => {
    setIsContactsOpen(false);
    navigate(`/messages/${userId}`);
    setSelectedAction(null);
  }, [navigate]);

  /**
   * Open QuickActionsModal
   */
  const openActions = useCallback(() => {
    setIsActionsOpen(true);
  }, []);

  /**
   * Close QuickActionsModal
   */
  const closeActions = useCallback(() => {
    setIsActionsOpen(false);
  }, []);

  /**
   * Close MachineSelectModal
   */
  const closeMachines = useCallback(() => {
    setIsMachinesOpen(false);
    setSelectedAction(null); // Reset action if user cancels
  }, []);

  /**
   * Close ContactSelectModal
   */
  const closeContacts = useCallback(() => {
    setIsContactsOpen(false);
    setSelectedAction(null); // Reset action if user cancels
  }, []);

  return {
    // Modal states
    isActionsOpen,
    isMachinesOpen,
    isContactsOpen,
    setIsActionsOpen,
    setIsMachinesOpen,
    setIsContactsOpen,

    // Selected action tracking
    selectedAction,

    // Data for modals
    machines,
    contacts,
    isLoadingMachines,
    isLoadingContacts,

    // Action handlers
    openActions,
    closeActions,
    handleActionSelect,
    handleMachineSelect,
    handleContactSelect,
    closeMachines,
    closeContacts,

    // Strategic future: Analytics tracking
    // trackQuickAction: (actionId: string, machineId?: string) => {
    //   analytics.track('quick_action_used', { action: actionId, machine: machineId });
    // },

    // Strategic future: Recent actions for quick access
    // recentActions: [] as QuickActionId[],
    // addToRecentActions: (actionId: QuickActionId) => { ... },

    // Strategic future: Favoritos/pins
    // pinnedMachines: [] as string[],
    // pinnedContacts: [] as string[],
  };
}
