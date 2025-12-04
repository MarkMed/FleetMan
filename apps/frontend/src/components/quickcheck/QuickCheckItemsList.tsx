import React from 'react';
import type { QuickCheckItem, QuickCheckMode } from '@models/QuickCheck';

interface QuickCheckItemsListProps {
  items: QuickCheckItem[];
  mode: QuickCheckMode;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const QuickCheckItemsList: React.FC<QuickCheckItemsListProps> = ({
  items,
  mode,
  onEditItem,
  onDeleteItem,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Items de verificación ({items.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow"
          >
            {/* Item number */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{index + 1}</span>
            </div>

            {/* Item content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground">{item.name}</h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>

            {/* Actions (только в режиме EDITING) */}
            {mode === 'EDITING' && onEditItem && onDeleteItem && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onEditItem(item.id)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  title="Editar item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Eliminar item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
