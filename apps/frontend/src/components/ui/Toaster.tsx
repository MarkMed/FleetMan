import * as React from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@components/ui/Toast';
import { useToast } from '@hooks/useToast';

/**
 * Toaster Component
 * 
 * Renders all active toasts and provides the toast context.
 * Should be placed at the root level of your application.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <div>
 *       <YourAppContent />
 *       <Toaster />
 *     </div>
 *   );
 * }
 * ```
 */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 weaaa">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}