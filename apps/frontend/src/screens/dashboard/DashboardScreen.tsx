import React from "react";
import { useAuth } from "../../store/AuthProvider";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../hooks/useDashboard";
import { EventWidget, QuickCheckWidget } from "../../components/dashboard";
import { Heading1 } from "@components/ui";

/**
 * DashboardScreen - Sprint #12 (Bundle 12)
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
 *
 * Architecture:
 * - useDashboard hook gestiona datos y paginación
 * - Widgets independientes (EventWidget, QuickCheckWidget)
 * - TanStack Query para cache y optimización
 */
export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Heading1>
          {t("dashboard.title", "Dashboard FleetMan")}
        </Heading1>
      </div>

      {/* Main Content - Two Sections */}
      <div className="space-y-4">
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
    </div>
  );
};
