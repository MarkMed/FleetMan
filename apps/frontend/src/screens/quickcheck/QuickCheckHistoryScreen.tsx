import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card } from "@components/ui";
import { useModalStore } from "@store/slices/modalSlice";
import { useQuickCheckHistoryViewModel } from "../../viewModels/machines/useQuickCheckHistoryViewModel";
import type { IQuickCheckRecord, IQuickCheckItem } from "@domain";

/**
 * QuickCheckHistoryScreen - Muestra el historial de QuickChecks ejecutados para una máquina
 *
 * Responsabilidades:
 * - Renderizado de UI (breadcrumbs, cards, modales)
 * - Interacción con usuario (clicks, navegación)
 *
 * La lógica de negocio y manejo de datos está en useQuickCheckHistoryViewModel
 */
export const QuickCheckHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showModal } = useModalStore();

  // ViewModel: Toda la lógica de datos y formateo
  const vm = useQuickCheckHistoryViewModel();

  // Show detail modal
  const handleShowDetail = (record: IQuickCheckRecord) => {
    showModal({
      title: "Detalles del QuickCheck",
      content: <QuickCheckDetailModal record={record} vm={vm} />,
      showCloseButton: true,
      dismissible: true,
      size: "lg",
      showConfirm: false,
      showCancel: false,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to={vm.paths.machines} className="hover:text-foreground">
            Máquinas
          </Link>
          <span>/</span>
          <Link to={vm.paths.machineDetail} className="hover:text-foreground">
            Detalle
          </Link>
          <span>/</span>
          <Link to={vm.paths.quickCheck} className="hover:text-foreground">
            QuickCheck
          </Link>
          <span>/</span>
          <span className="text-foreground">Historial</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Historial de Revisiones
            </h1>
            <p className="text-muted-foreground mt-1">
              QuickChecks ejecutados para esta máquina
            </p>
          </div>
          <Button
            variant="outline"
            size="default"
            onPress={() => navigate(vm.paths.quickCheck)}
          >
            ← Volver al QuickCheck
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {vm.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Cargando historial...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {vm.error && (
        <Card className="p-6">
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Error al cargar historial
            </h3>
            <p className="mt-2 text-muted-foreground">
              {vm.error instanceof Error
                ? vm.error.message
                : "Ocurrió un error inesperado"}
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!vm.isLoading && !vm.error && !vm.hasRecords && (
        <Card className="p-6">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No hay QuickChecks realizados
            </h3>
            <p className="mt-2 text-muted-foreground">
              Aún no se han ejecutado QuickChecks para esta máquina
            </p>
            <Button
              variant="filled"
              className="mt-6"
              onPress={() => navigate(vm.paths.quickCheck)}
            >
              Realizar primer QuickCheck
            </Button>
          </div>
        </Card>
      )}

      {/* History Grid */}
      {!vm.isLoading && !vm.error && vm.hasRecords && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vm.records.map((record: IQuickCheckRecord, index: number) => {
            const stats = vm.calculateStats(record);

            return (
              <Card
                key={index}
                className="p-5 hover:shadow-lg transition-shadow"
                style={{
                  animation: `fadeSlideIn 0.4s ease-out ${index * 0.16}s both`,
                }}
              >
                {/* Header: Date and Result Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {vm.formatDate(record.date)}
                    </p>
                    {/* Responsible Info - Sprint 8 */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {record.responsibleName} ({record.responsibleWorkerId})
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${vm.getResultBadgeClasses(record.result)}`}
                  >
                    {vm.getResultDisplayText(record.result)}
                  </span>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{stats.approved}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{stats.disapproved}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{stats.omitted}</span>
                  </div>
                </div>

                {/* Observations (truncated) */}
                {record.observations && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {record.observations}
                    </p>
                  </div>
                )}

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleShowDetail(record)}
                  className="w-full"
                >
                  Ver detalles
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * QuickCheckDetailModal - Modal component to show full QuickCheck details
 *
 * Props:
 * - record: El registro de QuickCheck a mostrar
 * - vm: ViewModel con helpers de formateo y display
 */
const QuickCheckDetailModal: React.FC<{
  record: IQuickCheckRecord;
  vm: ReturnType<typeof useQuickCheckHistoryViewModel>;
}> = ({ record, vm }) => {
  // Helper: Render icon based on result type
  const renderResultIcon = (
    type: "approved" | "disapproved" | "omitted" | "unknown"
  ) => {
    switch (type) {
      case "approved":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "disapproved":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "omitted":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Responsible Info Section - Sprint 8 */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">
            Responsable
          </h4>
          <p className="text-sm font-medium text-foreground">
            {record.responsibleName}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">
            ID Trabajador
          </h4>
          <p className="text-sm font-medium text-foreground">
            {record.responsibleWorkerId}
          </p>
        </div>
      </div>

      {/* Observations Section */}
      {record.observations && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Observaciones
          </h3>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {record.observations}
          </p>
        </div>
      )}

      {/* Items List */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Items Evaluados ({record.quickCheckItems.length})
        </h3>
        <div className="space-y-2">
          {record.quickCheckItems.map(
            (item: IQuickCheckItem, index: number) => {
              const display = vm.getItemResultDisplay(item.result);

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${display.bgClass}`}
                >
                  {/* Item Number */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>

                  {/* Item Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {renderResultIcon(display.type)}
                        <span className="text-xs font-medium">
                          {display.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
