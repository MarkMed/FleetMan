import React from 'react';
import { cn } from '../../utils/cn';

export interface CircularProgressProps {
  /** Progreso del 0 al 100 */
  progress: number;
  /** Tamaño del círculo en pixels */
  size?: number;
  /** Grosor del trazo */
  strokeWidth?: number;
  /** Clase CSS adicional */
  className?: string;
  /** Color del progreso */
  progressColor?: string;
  /** Color del fondo */
  backgroundColor?: string;
}

/**
 * Componente de progreso circular para el timer
 * Usa SVG para animación suave y escalable
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 20,
  strokeWidth = 2,
  className,
  progressColor = 'currentColor',
  backgroundColor = 'transparent',
}) => {
  // Calcular valores del círculo
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90" // Empezar desde arriba
        style={{ minWidth: size, minHeight: size }}
      >
        {/* Círculo de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.2}
        />
        
        {/* Círculo de progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
    </div>
  );
};