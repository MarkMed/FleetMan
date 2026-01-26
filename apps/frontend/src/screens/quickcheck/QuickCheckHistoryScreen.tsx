import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, BodyText } from "@components/ui";
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
  const { t } = useTranslation();
  const { showModal } = useModalStore();

  // ViewModel: Toda la lógica de datos y formateo
  const vm = useQuickCheckHistoryViewModel();

  // Show detail modal
  const handleShowDetail = (record: IQuickCheckRecord) => {
    showModal({
      title: t('quickchecks.history.modal.title'),
      content: <QuickCheckDetailModal record={record} vm={vm} />,
      showCloseButton: true,
      dismissible: true,
      size: "lg",
      showConfirm: false,
      showCancel: false,
      // variant: 'info',
      // showColoredBorder: true,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to={vm.paths.machines} className="hover:text-foreground">
            {t('quickchecks.history.breadcrumbs.machines')}
          </Link>
          <span>/</span>
          <Link to={vm.paths.machineDetail} className="hover:text-foreground">
            {t('quickchecks.history.breadcrumbs.detail')}
          </Link>
          <span>/</span>
          <Link to={vm.paths.quickCheck} className="hover:text-foreground">
            {t('quickchecks.history.breadcrumbs.quickcheck')}
          </Link>
          <span>/</span>
          <span className="text-foreground">{t('quickchecks.history.breadcrumbs.history')}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('quickchecks.history.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('quickchecks.history.subtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            size="default"
            onPress={() => navigate(vm.paths.quickCheck)}
          >
            ← {t('quickchecks.history.backButton')}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {vm.isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">{t('quickchecks.history.loading')}</p>
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
              {t('quickchecks.history.error.title')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {vm.error instanceof Error
                ? vm.error.message
                : t('quickchecks.history.error.unexpected')}
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
              {t('quickchecks.history.empty.title')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t('quickchecks.history.empty.description')}
            </p>
            <Button
              variant="filled"
              className="mt-6"
              onPress={() => navigate(vm.paths.quickCheck)}
            >
              {t('quickchecks.history.empty.action')}
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
                <div className="flex flex-col items-start justify-between mb-4 border-b border-border pb-2 border-b-gray-500/20">
                  <div className="w-full flex items-center justify-between">
                    <BodyText
                      size="medium"
                      className={`px-2.5 rounded-full flex-shrink-0 -ml-2 ${vm.getResultBadgeClasses(record.result)}`}
                    >
                      {vm.getResultDisplayText(record.result)}
                    </BodyText>
                    <BodyText size="medium" weight="medium" className="text-sm font-medium text-foreground">
                      {vm.formatDate(record.date)}
                    </BodyText>
                  </div>
                </div>

                {/* Stats Summary - Vertical layout con íconos grandes */}
                <div className="flex flex-row flex-wrap justify-evenly gap-2 mb-3 text-sm border-b border-border pb-2 border-b-gray-500/20">
                  <div className="flex flex-row items-center justify-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <BodyText size="medium" className="text-green-600 dark:text-green-400 pt-0.5">
                      <span className="font-bold">{stats.approved}</span> {t('quickchecks.stats.approved')}
                    </BodyText>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-1 text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <BodyText size="medium" className="text-red-600 dark:text-red-400 pt-0.5">
                      <span className="font-bold">{stats.disapproved}</span> {t('quickchecks.stats.disapproved')}
                    </BodyText>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <BodyText size="medium" className="text-yellow-600 dark:text-yellow-400">
                      <span className="font-bold">{stats.omitted}</span> {t('quickchecks.stats.omitted')}
                    </BodyText>
                  </div>
                </div>

                {/* Responsible Info con ícono */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <BodyText className="text-muted-foreground" size="regular" weight="medium">
                    {record.responsibleName} ({record.responsibleWorkerId})
                  </BodyText>
                </div>

                {/* Observations - Estilo de diálogo */}
                {record.observations && (
                  <div className="mb-3 flex flex-col justify-start">
                    <div className="h-3 w-3 rotate-45 translate-y-[50%] translate-x-[20%] bg-gray-200 dark:bg-slate-700 border border-gray-500 dark:border-slate-600 z-0"></div>
                    <div className="bg-gray-200 dark:bg-slate-700 border border-border rounded-lg p-3 rounded-tl-none border border-gray-500 dark:border-slate-500 z-10 border-t-0">
                      <BodyText size="regular" className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {record.observations}
                      </BodyText>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleShowDetail(record)}
                  className="w-full"
                >
                  {t('quickchecks.history.viewDetails')}
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
  const { t } = useTranslation();
  
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
            {t('quickchecks.history.modal.responsible')}
          </h4>
          <p className="text-sm font-medium text-foreground">
            {record.responsibleName}
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">
            {t('quickchecks.history.modal.workerId')}
          </h4>
          <p className="text-sm font-medium text-foreground">
            {record.responsibleWorkerId}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {t('quickchecks.history.modal.itemsEvaluated')} ({record.quickCheckItems.length})
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
      
      {/* Observations Section */}
      {record.observations && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t('quickchecks.history.modal.observations')}
          </h3>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {record.observations}
          </p>
        </div>
      )}
    </div>
  );
};
