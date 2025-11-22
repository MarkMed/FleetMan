import React from 'react';
import { Button, ButtonProps } from './Button';
import { CircularProgress } from './CircularProgress';
import { useButtonTimer } from '../../hooks/useButtonTimer';
import { cn } from '../../utils/cn';

export interface TimerButtonProps extends Omit<ButtonProps, 'onPress' | 'disabled' | 'children'> {
  /** Si el timer debe iniciar automáticamente al renderizar */
  startOnRender?: boolean;
  /** Duración del timer en segundos */
  duration?: number;
  /** Función que se ejecuta cuando el timer expira */
  onAction: () => void;
  /** Texto inicial del botón */
  label: string;
  /** Función opcional para mostrar el texto mientras corre el timer */
  timerLabel?: (remaining: number) => string;
  /** Si mostrar el progreso circular */
  showProgress?: boolean;
  /** Si el botón debe estar deshabilitado externamente */
  disabled?: boolean;
  /** Si usar doble confirmación (timer auto + timer cancelable) */
  doubleConfirmation?: boolean;
  /** Si el botón debe resetearse automáticamente tras ejecutar la acción */
  resetOnAction?: boolean;
}

/**
 * Botón con timer integrado para prevenir clicks accidentales
 * 
 * CASOS DE USO:
 * 1. startOnRender=true (DEFAULT): Timer automático
 *    - Timer inicia al renderizar (botón deshabilitado)
 *    - Al terminar → botón habilitado, usuario debe hacer click para ejecutar
 * 
 * 2. startOnRender=false: Timer on-click (cancelable)
 *    - Botón habilitado inicialmente
 *    - Click inicia timer, botón permanece habilitado para cancelar
 *    - Timer completo = ejecuta acción automáticamente
 * 
 * 3. doubleConfirmation=true: Modo mixto (máxima seguridad)
 *    - Primera fase: Timer automático (botón deshabilitado)
 *    - Segunda fase: Usuario confirma → timer cancelable
 *    - Si no se cancela → ejecuta acción automáticamente
 * 4. resetOnAction=true: Reseteo automático
 *   - Tras ejecutar la acción, el botón vuelve a su estado inicial
 * 
 * EJEMPLOS:
 * ```tsx
 * // Doble confirmación (máxima seguridad)
 * <TimerButton
 *   doubleConfirmation={true}
 *   duration={5}
 *   label="Eliminar"
 *   onAction={handleDelete}
 *   variant="destructive"
 * />
 * 
 * // Timer simple cancelable
 * <TimerButton
 *   startOnRender={false}
 *   duration={3}
 *   label="Confirmar"
 *   onAction={handleSubmit}
 * />
 * ```
 */
export const TimerButton: React.FC<TimerButtonProps> = ({
  startOnRender = true, // Default true
  duration = 7,
  onAction,
  label,
  timerLabel,
  showProgress = true,
  disabled: externalDisabled = false,
  doubleConfirmation = false, // Default false
  resetOnAction = false,
  className,
  variant = 'filled',
  size = 'default',
  ...buttonProps
}) => {
  const {
    remainingTime,
    isRunning,
    isDisabled: timerDisabled,
    currentLabel,
    progress,
    handleClick,
    isAwaitingConfirmation,
  } = useButtonTimer({
    duration,
    startOnRender,
    onAction,
    timerLabel,
    doubleConfirmation,
    resetOnAction,
  });

  // Determinar el estado final del botón
  const isButtonDisabled = externalDisabled || timerDisabled;
  
  // Determinar el texto a mostrar con lógica de confirmación
  let finalDisplayText: string;
  
  if (isAwaitingConfirmation) {
    // Estado de confirmación: botón habilitado, texto de confirmación
    finalDisplayText = `Click para confirmar "${label}"`;
  } else if (isRunning && currentLabel) {
    // Timer corriendo con label personalizado
    finalDisplayText = currentLabel;
  } else if (isRunning) {
    // Timer corriendo sin label personalizado
    finalDisplayText = `${label} (${remainingTime}s)`;
  } else {
    // Estado normal
    finalDisplayText = label;
  }

  return (
    <Button
      {...buttonProps}
      variant={variant}
      size={size}
      onPress={handleClick}
      disabled={isButtonDisabled}
      className={cn(
        'relative',
        // Efectos visuales durante timer
        isRunning && 'cursor-wait',
        className
      )}
    >
      {/* Contenido principal */}
      <div className="flex items-center gap-2">
        {/* Progreso circular */}
        {showProgress && isRunning && (
          <CircularProgress
            progress={progress}
            size={16}
            strokeWidth={2}
            progressColor="currentColor"
            className="shrink-0"
          />
        )}
        
        {/* Texto del botón */}
        <span>{finalDisplayText}</span>
      </div>
      
      {/* Indicador de timer activo con animación sutil */}
      {isRunning && (
        <div
          className={cn(
            'absolute inset-0 rounded-md border-2 border-current opacity-30',
            'animate-pulse'
          )}
          style={{
            animationDuration: '2s',
          }}
        />
      )}
    </Button>
  );
};