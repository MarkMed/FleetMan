import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseButtonTimerProps {
  /** Duración del timer en segundos */
  duration: number;
  /** Si el timer debe iniciar automáticamente al renderizar */
  startOnRender?: boolean;
  /** Función a ejecutar cuando el timer termine */
  onAction: () => void;
  /** Función opcional para generar texto del timer */
  timerLabel?: (remaining: number) => string;
  /** Si usar doble confirmación (timer auto + timer cancelable) */
  doubleConfirmation?: boolean;
  /** Si el botón debe resetearse automáticamente tras ejecutar la acción */
  resetOnAction?: boolean;
}

export interface UseButtonTimerReturn {
  /** Tiempo restante en segundos */
  remainingTime: number;
  /** Si el timer está corriendo */
  isRunning: boolean;
  /** Si el botón debe estar deshabilitado */
  isDisabled: boolean;
  /** Texto actual a mostrar en el botón */
  currentLabel: string;
  /** Progreso del timer (0-100) */
  progress: number;
  /** Función para manejar clicks en el botón */
  handleClick: () => void;
  /** Función para cancelar el timer manualmente */
  cancelTimer: () => void;
  /** Función para iniciar el timer manualmente */
  startTimer: () => void;
  /** Si está en la fase de confirmación final (solo para startOnRender=true) */
  isAwaitingConfirmation: boolean;
}

/**
 * Hook personalizado para manejar la lógica del timer en botones
 * 
 * Casos de uso:
 * 1. startOnRender=true: Timer automático (modales, confirmaciones)
 * 2. startOnRender=false: Timer on-click (acciones críticas)
 */
// --- STRATEGY PATTERN REFACTOR ---

// Interfaz para estrategias de timer
interface TimerStrategy {
  shouldStartOnMount: boolean;
  handleClick: () => void;
  onTimerComplete: () => void;
  isButtonDisabled: () => boolean;
  // Métodos estratégicos sugeridos para extensión:
  // getCurrentPhase?(): string;
  // canCancel?(): boolean;
}

export function useButtonTimer({
  duration,
  startOnRender = true,
  onAction,
  timerLabel,
  doubleConfirmation = false,
  resetOnAction = false,
}: UseButtonTimerProps): UseButtonTimerReturn {
  // Estado compartido
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [isSecondPhase, setIsSecondPhase] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar interval para evitar memory leaks
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);


  // --- Estrategias como funciones puras y ref estable ---
  const strategyRef = useRef<TimerStrategy | null>(null);

  // Siempre usar los setters/valores actuales
  function createStrategy(): TimerStrategy {
    // 1. Timer doble confirmación
    if (doubleConfirmation) {
      return {
        shouldStartOnMount: true,
        handleClick: () => {
          if (hasExecuted) return;
          if (isAwaitingConfirmation) {
            setIsAwaitingConfirmation(false);
            setIsSecondPhase(true);
            startTimer();
          } else if (isRunning && isSecondPhase) {
            cancelTimer();
          }
        },
        onTimerComplete: () => {
          if (hasExecuted) return;
          if (!isSecondPhase) {
            setIsAwaitingConfirmation(true);
          } else {
            setHasExecuted(true);
            onAction();
            if (resetOnAction) {
              setTimeout(() => {
                setIsAwaitingConfirmation(true);
                setIsSecondPhase(false);
                setHasExecuted(false);
                setRemainingTime(duration);
              }, 0);
            }
          }
        },
        isButtonDisabled: () => isRunning && !isSecondPhase,
        // getCurrentPhase?() { return isSecondPhase ? 'second' : 'first'; }
      };
    } else if (startOnRender) {
      // 2. Timer automático
      return {
        shouldStartOnMount: true,
        handleClick: () => {
          if (hasExecuted) return;
          if (isAwaitingConfirmation) {
            setHasExecuted(true);
            onAction();
            setIsAwaitingConfirmation(false);
            if (resetOnAction) {
              setTimeout(() => {
                setIsAwaitingConfirmation(false);
                setHasExecuted(false);
                setRemainingTime(duration);
                setIsRunning(false);
              }, 0);
            }
          }
        },
        onTimerComplete: () => {
          if (hasExecuted) return;
          setIsAwaitingConfirmation(true);
        },
        isButtonDisabled: () => isRunning,
        // getCurrentPhase?() { return 'auto'; }
      };
    } else {
      // 3. Timer cancelable
      return {
        shouldStartOnMount: false,
        handleClick: () => {
          if (hasExecuted) return;
          if (isRunning) {
            cancelTimer();
          } else {
            startTimer();
          }
        },
        onTimerComplete: () => {
          if (hasExecuted) return;
          setHasExecuted(true);
          onAction();
          if (resetOnAction) {
            setTimeout(() => {
              setHasExecuted(false);
              setRemainingTime(duration);
              setIsRunning(false);
            }, 0);
          }
        },
        isButtonDisabled: () => false,
        // canCancel?() { return isRunning; }
      };
    }
  }

  // Actualizar la estrategia en cada render
  strategyRef.current = createStrategy();
  const strategy = strategyRef.current;


  // Timer core logic
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setRemainingTime(duration);
    setIsAwaitingConfirmation(false);
    setHasExecuted(false);
    clearCurrentInterval();
    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 0) {
          // Mostrar 0 durante un ciclo completo
          if (prev === 0) {
            return -1;
          }
          // Ahora sí ejecutar acción y limpiar
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          strategyRef.current?.onTimerComplete();
          return -1;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, clearCurrentInterval]);

  const cancelTimer = useCallback(() => {
    clearCurrentInterval();
    setIsRunning(false);
    setRemainingTime(duration);
    // Si estamos en doubleConfirmation y en segunda fase, volver a estado de confirmación
    if (doubleConfirmation && isSecondPhase) {
      setIsAwaitingConfirmation(true);
      setIsSecondPhase(false);
      setHasExecuted(false);
    } else {
      setIsAwaitingConfirmation(false);
      setIsSecondPhase(false);
      setHasExecuted(false);
    }
  }, [clearCurrentInterval, duration, doubleConfirmation, isSecondPhase]);


  // Delegar click a la estrategia (siempre usar ref)
  const handleClick = useCallback(() => {
    strategyRef.current?.handleClick();
  }, []);


  // Iniciar timer automáticamente si corresponde
  useEffect(() => {
    if (strategyRef.current?.shouldStartOnMount) {
      startTimer();
    }
    return () => {
      clearCurrentInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOnRender, doubleConfirmation, startTimer, clearCurrentInterval]);

  // Calcular valores derivados

  // Mostrar 0 como mínimo en UI y progress
  const progress = (Math.max(remainingTime, 0) / duration) * 100;
  const currentLabel = isRunning && timerLabel ? timerLabel(Math.max(remainingTime, 0)) : '';
  const isDisabled = strategyRef.current?.isButtonDisabled() ?? false;

  return {
    remainingTime,
    isRunning,
    isDisabled,
    currentLabel,
    progress,
    handleClick,
    cancelTimer,
    startTimer,
    isAwaitingConfirmation,
  };
}