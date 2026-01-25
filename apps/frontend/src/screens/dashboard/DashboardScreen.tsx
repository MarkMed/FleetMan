import React from "react";
import { useAuth } from "../../store/AuthProvider";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../hooks/useDashboard";
import { 
  EventWidget, 
  QuickCheckWidget,
  QuickActionsButton,
  QuickActionsModal,
  MachineSelectModal,
  ContactSelectModal 
} from "../../components/dashboard";
import { Heading1 } from "@components/ui";
import { useQuickActions } from "../../hooks/useQuickActions";

/**
 * DashboardScreen - Sprint #12 (Bundle 12) + Sprint #14 Task 2.1c
 *
 * Dashboard simplificado con dos secciones principales:
 * 1. Últimos Reportes de Eventos (arriba)
 * 2. Últimos QuickChecks Realizados (abajo)
 *
 * Features:
 * - Carousel horizontal scrollable para cada sección
 * - Paginación incremental con botón "Ver más"
 * - Estados: loading, error, empty
 * - Orden cronológico descendente (más recientes primero)
 * - QuickActions: Float Action Button con acceso rápido a funciones principales
 *
 * Architecture:
 * - useDashboard hook gestiona datos y paginación
 * - useQuickActions hook gestiona sistema de acciones rápidas
 * - Widgets independientes (EventWidget, QuickCheckWidget)
 * - TanStack Query para cache y optimización
 */
export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    // Data
    quickChecks,
    events,

    // Pagination flags
    hasMoreQuickChecks,
    hasMoreEvents,

    // Loading states
    isLoadingQuickChecks,
    isLoadingEvents,
    isLoadingMoreQuickChecks,
    isLoadingMoreEvents,

    // Error states
    quickChecksError,
    eventsError,

    // Actions
    loadMoreQuickChecks,
    loadMoreEvents,
  } = useDashboard();

  // QuickActions system - Sprint #14 Task 2.1c
  const quickActions = useQuickActions();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Heading1>
          {t("dashboard.title", "Dashboard FleetMan")}
        </Heading1>
      </div>

      {/* Main Content - Two Sections */}
      <div className="space-y-4 pb-24">
        {/* Section 1: Últimos Reportes de Eventos (PRIMERO) */}
        <EventWidget
          events={events}
          isLoading={isLoadingEvents}
          isLoadingMore={isLoadingMoreEvents}
          hasMore={hasMoreEvents}
          error={eventsError}
          onLoadMore={loadMoreEvents}
        />

        {/* Section 2: Últimos QuickChecks Realizados */}
        <QuickCheckWidget
          quickChecks={quickChecks}
          isLoading={isLoadingQuickChecks}
          isLoadingMore={isLoadingMoreQuickChecks}
          hasMore={hasMoreQuickChecks}
          error={quickChecksError}
          onLoadMore={loadMoreQuickChecks}
        />
      </div>

      {/* Float Action Button - Sprint #14 Task 2.1c */}
      <QuickActionsButton onPress={quickActions.openActions} />

      {/* QuickActions Modals */}
      <QuickActionsModal
        open={quickActions.isActionsOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeActions();
        }}
        onActionSelect={quickActions.handleActionSelect}
      />

      <MachineSelectModal
        open={quickActions.isMachinesOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeMachines();
        }}
        machines={quickActions.machines}
        onSelectMachine={quickActions.handleMachineSelect}
        actionType={quickActions.selectedAction}
        isLoading={quickActions.isLoadingMachines}
      />

      <ContactSelectModal
        open={quickActions.isContactsOpen}
        onOpenChange={(open) => {
          if (!open) quickActions.closeContacts();
        }}
        contacts={quickActions.contacts}
        onSelectContact={quickActions.handleContactSelect}
        isLoading={quickActions.isLoadingContacts}
      />
    </div>
  );
};
