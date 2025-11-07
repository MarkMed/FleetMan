import * as React from 'react';

/**
 * Simplified Toast Interface for easy usage
 */
interface ToastMessage {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Maximum number of toasts that can be displayed at once
 */
const TOAST_LIMIT = 5;

/**
 * Default duration for toasts (in milliseconds)
 */
const TOAST_REMOVE_DELAY = 1000000;

/**
 * Action types for the toast reducer
 */
type ActionType =
  | {
      type: 'ADD_TOAST';
      toast: ToastMessage;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<ToastMessage>;
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: ToastMessage['id'];
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: ToastMessage['id'];
    };

/**
 * Toast state interface
 */
interface State {
  toasts: ToastMessage[];
}

/**
 * Maps of toast IDs to their timeout IDs for auto-dismissal
 */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Add a toast to the timeout map for auto-dismissal
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Toast reducer function
 */
export const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // If no ID provided, dismiss all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }

      // Dismiss specific toast
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

/**
 * Global listeners for toast state changes
 */
const listeners: Array<(state: State) => void> = [];

/**
 * Global toast state
 */
let memoryState: State = { toasts: [] };

/**
 * Dispatch function for toast actions
 */
function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

/**
 * Toast function interface for easy toast creation
 */
type Toast = {
  (props: Omit<ToastMessage, 'id'>): {
    id: string;
    dismiss: () => void;
    update: (props: Omit<ToastMessage, 'id'>) => void;
  };
  success: (props: Omit<ToastMessage, 'id' | 'variant'>) => {
    id: string;
    dismiss: () => void;
    update: (props: Omit<ToastMessage, 'id'>) => void;
  };
  error: (props: Omit<ToastMessage, 'id' | 'variant'>) => {
    id: string;
    dismiss: () => void;
    update: (props: Omit<ToastMessage, 'id'>) => void;
  };
  warning: (props: Omit<ToastMessage, 'id' | 'variant'>) => {
    id: string;
    dismiss: () => void;
    update: (props: Omit<ToastMessage, 'id'>) => void;
  };
  info: (props: Omit<ToastMessage, 'id' | 'variant'>) => {
    id: string;
    dismiss: () => void;
    update: (props: Omit<ToastMessage, 'id'>) => void;
  };
  dismiss: (toastId?: string) => void;
};

/**
 * Generate unique ID for toasts
 */
function genId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Main toast function
 */
const toast: Toast = (props) => {
  const id = genId();

  const update = (props: Omit<ToastMessage, 'id'>) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
};

/**
 * Success toast variant
 */
toast.success = (props) =>
  toast({
    ...props,
    variant: 'success',
  });

/**
 * Error toast variant
 */
toast.error = (props) =>
  toast({
    ...props,
    variant: 'destructive',
  });

/**
 * Warning toast variant
 */
toast.warning = (props) =>
  toast({
    ...props,
    variant: 'warning',
  });

/**
 * Info toast variant
 */
toast.info = (props) =>
  toast({
    ...props,
    variant: 'info',
  });

/**
 * Dismiss toasts
 */
toast.dismiss = (toastId?: string) =>
  dispatch({ type: 'DISMISS_TOAST', toastId });

/**
 * Custom hook for using toasts in components
 */
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { toast };