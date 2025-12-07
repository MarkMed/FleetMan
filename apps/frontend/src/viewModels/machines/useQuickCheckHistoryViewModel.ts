import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quickCheckService } from '@services/api/quickCheckService';
import { QUERY_KEYS } from '@constants';
import { useAuth } from '@store/AuthProvider';
import type { IQuickCheckRecord, IQuickCheckItem } from '@domain';

/**
 * ViewModel para QuickCheck History
 * 
 * Responsabilidades:
 * - Gestión de datos del historial (fetch via React Query)
 * - Formateo de fechas
 * - Cálculo de estadísticas por registro
 * - Mapeo de estados a UI (badges, iconos, clases CSS)
 * - Lógica de navegación
 * 
 * La vista solo consume estos datos y los renderiza.
 */
export function useQuickCheckHistoryViewModel() {
  const { id: machineId } = useParams<{ id: string }>();
  const { token } = useAuth();

  // ===== Data fetching =====
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.QUICKCHECK_HISTORY(machineId || ''),
    queryFn: async () => {
      if (!machineId) throw new Error('Machine ID is required');
      
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      return await quickCheckService.getHistory(machineId, undefined, headers);
    },
    enabled: !!machineId,
  });

  // ===== Computed values =====
  const records = data?.quickChecks || [];
  const hasRecords = records.length > 0;
  const totalRecords = data?.total || 0;

  // ===== Helper: Format date =====
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

  // ===== Helper: Calculate stats for a record =====
  const calculateStats = (record: IQuickCheckRecord) => {
    const approved = record.quickCheckItems.filter(
      (item: IQuickCheckItem) => item.result === 'approved'
    ).length;
    const disapproved = record.quickCheckItems.filter(
      (item: IQuickCheckItem) => item.result === 'disapproved'
    ).length;
    const omitted = record.quickCheckItems.filter(
      (item: IQuickCheckItem) => item.result === 'omitted'
    ).length;
    
    return { approved, disapproved, omitted };
  };

  // ===== Helper: Get result badge classes =====
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

  // ===== Helper: Get result display text =====
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

  // ===== Helper: Get item result display (type + label + classes) =====
  const getItemResultDisplay = (result: string) => {
    switch (result) {
      case 'approved':
        return {
          type: 'approved' as const,
          label: 'Aprobado',
          bgClass: 'bg-green-50 dark:bg-green-950/20',
        };
      case 'disapproved':
        return {
          type: 'disapproved' as const,
          label: 'Desaprobado',
          bgClass: 'bg-red-50 dark:bg-red-950/20',
        };
      case 'omitted':
        return {
          type: 'omitted' as const,
          label: 'Omitido',
          bgClass: 'bg-yellow-50 dark:bg-yellow-950/20',
        };
      default:
        return {
          type: 'unknown' as const,
          label: result,
          bgClass: 'bg-gray-50 dark:bg-gray-950/20',
        };
    }
  };

  // ===== Navigation paths =====
  const paths = {
    machines: '/machines',
    machineDetail: `/machines/${machineId}`,
    quickCheck: `/machines/${machineId}/quickcheck`,
    history: `/machines/${machineId}/quickcheck/history`,
  };

  return {
    // Data
    machineId,
    records,
    hasRecords,
    totalRecords,
    isLoading,
    error,
    
    // Helpers
    formatDate,
    calculateStats,
    getResultBadgeClasses,
    getResultDisplayText,
    getItemResultDisplay,
    
    // Paths
    paths,
  };
}
