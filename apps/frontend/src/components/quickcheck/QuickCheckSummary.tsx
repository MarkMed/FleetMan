import React from 'react';
import type { EvaluationStats, OverallResult } from '@models/QuickCheck';
import { cn } from '@utils/cn';

interface QuickCheckSummaryProps {
  stats: EvaluationStats;
  overallResult: OverallResult;
}

export const QuickCheckSummary: React.FC<QuickCheckSummaryProps> = ({
  stats,
  overallResult,
}) => {
  const getResultBadgeClasses = () => {
    switch (overallResult) {
      case 'APROBADO':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700';
      case 'DESAPROBADO':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700';
      case 'PENDIENTE':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getResultIcon = () => {
    switch (overallResult) {
      case 'APROBADO':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'DESAPROBADO':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'PENDIENTE':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const progress = stats.total > 0 ? ((stats.total - stats.pendientes) / stats.total) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Result badge */}
      <div className="flex items-center justify-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold text-lg',
            getResultBadgeClasses()
          )}
        >
          {getResultIcon()}
          <span>Resultado: {overallResult}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Progreso</span>
          <span>{stats.total - stats.pendientes}/{stats.total} evaluados</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              overallResult === 'APROBADO' && 'bg-green-500',
              overallResult === 'DESAPROBADO' && 'bg-red-500',
              overallResult === 'PENDIENTE' && 'bg-gray-400'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-card border border-border rounded-lg">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-300">Aprobados</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.aprobados}</div>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-800">
          <div className="text-xs text-red-700 dark:text-red-300">Desaprobados</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.desaprobados}</div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-800">
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Omitidos</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.omitidos}</div>
        </div>
      </div>

      {/* Warning if pending */}
      {stats.pendientes > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 dark:bg-yellow-950/20 dark:border-yellow-800">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            Aún quedan <span className="font-semibold">{stats.pendientes} items pendientes</span> de evaluación
          </div>
        </div>
      )}

      {/* Info about omitidos */}
      {stats.omitidos > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Los items omitidos no afectan el resultado final
        </div>
      )}
    </div>
  );
};
