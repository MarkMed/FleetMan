import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '@components/ui';
import { useModalStore } from '@store/slices/modalSlice';
import { quickCheckService } from '@services/api/quickCheckService';
import { QUERY_KEYS } from '@constants';
import { useAuth } from '@store/AuthProvider';
import type { IQuickCheckRecord, IQuickCheckItem } from '@domain';

/**
 * QuickCheckHistoryScreen - Muestra el historial de QuickChecks ejecutados para una máquina
 * 
 * Features:
 * - Lista de todos los QuickChecks ejecutados
 * - Cards con información resumida (fecha, ejecutor, resultado, stats)
 * - Modal de detalles con items evaluados
 * - Loading states y empty states
 */
export const QuickCheckHistoryScreen: React.FC = () => {
  const { id: machineId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showModal, hideModal } = useModalStore();

  // Fetch QuickCheck history
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.QUICKCHECK_HISTORY(machineId || ''),
    queryFn: async () => {
      if (!machineId) throw new Error('Machine ID is required');
      
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      return await quickCheckService.getHistory(machineId, undefined, headers);
    },
    enabled: !!machineId,
  });

  // Show detail modal
  const handleShowDetail = (record: IQuickCheckRecord) => {
    showModal({
      title: 'Detalles del QuickCheck',
      content: <QuickCheckDetailModal record={record} />,
      showCloseButton: true,
      dismissible: true,
      size: 'lg',
      showConfirm: false,
      showCancel: false,
    });
  };

  // Helper: Format date
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  // Helper: Calculate stats
  const calculateStats = (record: IQuickCheckRecord) => {
    const approved = record.quickCheckItems.filter((item: IQuickCheckItem) => item.result === 'approved').length;
    const disapproved = record.quickCheckItems.filter((item: IQuickCheckItem) => item.result === 'disapproved').length;
    const omitted = record.quickCheckItems.filter((item: IQuickCheckItem) => item.result === 'omitted').length;
    return { approved, disapproved, omitted };
  };

  // Helper: Get result badge color
  const getResultBadgeClasses = (result: string): string => {
    switch (result) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400';
      case 'disapproved':
        return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400';
      case 'notInitiated':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400';
    }
  };

  // Helper: Get result display text
  const getResultDisplayText = (result: string): string => {
    switch (result) {
      case 'approved':
        return 'Aprobado';
      case 'disapproved':
        return 'Desaprobado';
      case 'notInitiated':
        return 'No Iniciado';
      default:
        return result;
    }
  };
  console.log('QuickCheck History Data:', data);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/machines" className="hover:text-foreground">Máquinas</Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">Detalle</Link>
          <span>/</span>
          <Link to={`/machines/${machineId}/quickcheck`} className="hover:text-foreground">QuickCheck</Link>
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
            onPress={() => navigate(`/machines/${machineId}/quickcheck`)}
          >
            ← Volver al QuickCheck
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Cargando historial...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar historial</h3>
            <p className="mt-2 text-muted-foreground">{error instanceof Error ? error.message : 'Ocurrió un error inesperado'}</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && data && data.quickChecks && data.quickChecks.length === 0 && (
        <Card className="p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No hay QuickChecks realizados</h3>
            <p className="mt-2 text-muted-foreground">
              Aún no se han ejecutado QuickChecks para esta máquina
            </p>
            <Button
              variant="filled"
              className="mt-6"
              onPress={() => navigate(`/machines/${machineId}/quickcheck`)}
            >
              Realizar primer QuickCheck
            </Button>
          </div>
        </Card>
      )}

      {/* History Grid */}
      {!isLoading && !error && data && data.quickChecks && data.quickChecks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.quickChecks.map((record, index) => {
            const stats = calculateStats(record);
            
            return (
              <Card key={index} className="p-5 hover:shadow-lg transition-shadow">
                {/* Header: Date and Result Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(record.date)}
                    </p>
                    {/* TODO: Fetch and display executor name from executedById */}
                    {/* <p className="text-xs text-muted-foreground mt-0.5">
                      Ejecutado por: {executorName}
                    </p> */}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getResultBadgeClasses(record.result)}`}>
                    {getResultDisplayText(record.result)}
                  </span>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{stats.approved}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{stats.disapproved}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
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

      {/* Optional: Total count display */}
      {/* {!isLoading && data && data.total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {data.quickChecks.length} de {data.total} registros
        </div>
      )} */}
    </div>
  );
};

/**
 * QuickCheckDetailModal - Modal component to show full QuickCheck details
 */
const QuickCheckDetailModal: React.FC<{ record: IQuickCheckRecord }> = ({ record }) => {
  // Helper: Get result icon and color
  const getItemResultDisplay = (result: string) => {
    switch (result) {
      case 'approved':
        return {
          icon: (
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Aprobado',
          bgClass: 'bg-green-50 dark:bg-green-950/20',
        };
      case 'disapproved':
        return {
          icon: (
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Desaprobado',
          bgClass: 'bg-red-50 dark:bg-red-950/20',
        };
      case 'omitted':
        return {
          icon: (
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Omitido',
          bgClass: 'bg-yellow-50 dark:bg-yellow-950/20',
        };
      default:
        return {
          icon: null,
          label: result,
          bgClass: 'bg-gray-50 dark:bg-gray-950/20',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Observations Section */}
      {record.observations && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Observaciones</h3>
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
          {record.quickCheckItems.map((item: IQuickCheckItem, index: number) => {
            const display = getItemResultDisplay(item.result);
            
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${display.bgClass}`}
              >
                {/* Item Number */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>

                {/* Item Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {display.icon}
                      <span className="text-xs font-medium">{display.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
