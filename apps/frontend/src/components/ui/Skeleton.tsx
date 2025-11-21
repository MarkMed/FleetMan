import React from 'react';

/**
 * Skeleton loader component for theme-driven UI
 * Usage: <Skeleton className="h-6 w-32 rounded" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-muted animate-pulse rounded-md ${className}`.trim()}
      aria-busy="true"
      aria-label="Cargando..."
    />
  );
}
