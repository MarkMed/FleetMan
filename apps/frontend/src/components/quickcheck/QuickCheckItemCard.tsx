import React from 'react';
import { Button } from '@components/ui';
import type { QuickCheckItem, QuickCheckMode, EvaluationStatus } from '@models/QuickCheck';
import { cn } from '@utils/cn';

interface QuickCheckItemCardProps {
  item: QuickCheckItem;
  index: number;
  mode: QuickCheckMode;
  status?: EvaluationStatus;
  onStatusChange?: (status: 'APROBADO' | 'DESAPROBADO' | 'OMITIDO') => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const QuickCheckItemCard: React.FC<QuickCheckItemCardProps> = ({
  item,
  index,
  mode,
  status,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  // Border color based on evaluation status
  const getBorderColor = () => {
    if (mode !== 'EXECUTING' || !status) return 'bg-slate-300 dark:bg-slate-950';
    switch (status) {
      case 'APROBADO':
        return 'border-green-500 bg-green-50/50 dark:bg-green-950/20';
      case 'DESAPROBADO':
        return 'border-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'OMITIDO':
        return 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
      default:
        return 'border-border bg-slate-300 dark:bg-slate-950';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg transition-all',
        getBorderColor()
      )}
    >
      {/* Item number badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">{index + 1}</span>
      </div>

      {/* Item content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground">{item.name}</h4>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        )}

        {/* Status indicator (EXECUTING mode) */}
        {mode === 'EXECUTING' && status && (
          <div className="mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                status === 'APROBADO' && 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                status === 'DESAPROBADO' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                status === 'OMITIDO' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
              )}
            >
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Actions based on mode */}
      <div className="flex gap-2 flex-shrink-0">
        {mode === 'EDITING' && onEdit && onDelete && (
          <>
            {/* Edit button */}
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Editar item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Eliminar item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}

        {mode === 'EXECUTING' && onStatusChange && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Aprobado button */}
            <Button
              variant={status === 'APROBADO' ? 'filled' : 'success'}
              size="sm"
              onPress={() => onStatusChange('APROBADO')}
              className={cn(
                'gap-1.5',
                status === 'APROBADO' && 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Aprobado</span>
            </Button>

            {/* Desaprobar button */}
            <Button
              variant={status === 'DESAPROBADO' ? 'filled' : 'destructive'}
              size="sm"
              onPress={() => onStatusChange('DESAPROBADO')}
              className={cn(
                'gap-1.5',
                status === 'DESAPROBADO' && 'bg-red-600 hover:bg-red-700 text-white'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Desaprobar</span>
            </Button>

            {/* Omitir button */}
            <Button
              variant={status === 'OMITIDO' ? 'filled' : 'warning'}
              size="sm"
              onPress={() => onStatusChange('OMITIDO')}
              className={cn(
                'gap-1.5',
                status === 'OMITIDO' && 'bg-yellow-600 hover:bg-yellow-700 text-white'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Omitir</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
