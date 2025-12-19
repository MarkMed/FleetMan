import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@store/AuthProvider';
import { sseClient } from '@services/sseClient';
import { QUERY_KEYS } from '@constants';
import { toast } from './useToast';

/**
 * Hook: Notification Observer for Real-Time SSE Events
 * 
 * Responsibilities:
 * 1. Connect SSE when user is authenticated
 * 2. Subscribe to notification events
 * 3. Show toast when notification arrives
 * 4. Invalidate TanStack Query cache to trigger refetch
 * 5. Cleanup connection on unmount
 * 
 * Architecture:
 * - Mounts ONCE at app level (MainLayout or App.tsx)
 * - Listens to SSE events via sseClient
 * - Reacts with UI feedback (toast) + cache invalidation
 * - All components benefit from updated cache
 * 
 * @example
 * ```tsx
 * // In MainLayout.tsx
 * export function MainLayout() {
 *   useNotificationObserver(); // Activate globally
 *   
 *   return <Outlet />;
 * }
 * ```
 * 
 * Flow:
 * 1. Backend creates notification → eventBus.emit()
 * 2. SSEManager pushes to connected devices
 * 3. EventSource.onmessage receives event
 * 4. sseClient.notify() calls this hook's handler
 * 5. Handler: invalidate queries + show toast
 * 6. TanStack Query auto-refetches notifications
 * 7. UI updates (badge count, notification list)
 * 
 * FIX: Uses useRef to stabilize values and prevent reconnection loop
 * - Empty dependency array = executes only on mount/unmount
 * - Refs updated separately to always have latest values
 */
export function useNotificationObserver() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Stabilize values with refs to prevent reconnection loop
  const userRef = useRef(user);
  const tokenRef = useRef(token);
  const queryClientRef = useRef(queryClient);
  const navigateRef = useRef(navigate);
  const tRef = useRef(t);

  // Update refs when values change (doesn't trigger useEffect)
  useEffect(() => {
    userRef.current = user;
    tokenRef.current = token;
    queryClientRef.current = queryClient;
    navigateRef.current = navigate;
    tRef.current = t;
  }, [user, token, queryClient, navigate, t]);

  // SSE connection lifecycle - executes ONLY on mount/unmount
  useEffect(() => {
    // Only connect if user is authenticated
    if (!userRef.current || !tokenRef.current) {
      console.log('[NotificationObserver] Skipping SSE connection (no user/token)');
      return;
    }

    console.log('[NotificationObserver] 🔌 Mounting SSE connection for userId:', userRef.current.id);

    // Connect SSE using ref values (stable across renders)
    sseClient.connect(tokenRef.current, userRef.current.id);

    // Subscribe to notification events
    const unsubscribe = sseClient.subscribe((event) => {
      console.log('📬 [NotificationObserver] Event received:', {
        id: event.notificationId,
        notificationType: event.notificationType,
        sourceType: event.sourceType,
        hasActionUrl: !!event.actionUrl,
        hasMetadata: !!event.metadata
      });

      // Use refs to access latest values without triggering reconnection
      const currentUser = userRef.current;
      const currentQueryClient = queryClientRef.current;
      const currentNavigate = navigateRef.current;
      const currentT = tRef.current;

      if (!currentUser) {
        console.warn('[NotificationObserver] No user available, skipping event handling');
        return;
      }

      // 1. Invalidate notifications query to trigger refetch
      currentQueryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS(currentUser.id)
      });

      // 2. Invalidate unread count to update badge
      currentQueryClient.invalidateQueries({
        queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD_COUNT(currentUser.id)
      });

      // 3. Show toast with appropriate variant
      // Fallback to 'info' if backend doesn't send notificationType (temporary fix)
      const toastVariant = event.notificationType || 'info'; // 'success' | 'warning' | 'error' | 'info'

      // Build toast title based on sourceType
      const title = event.sourceType
        ? currentT(`notification.types.${event.sourceType.toLowerCase()}`, event.sourceType)
        : currentT('notification.new');

      // Translate message with metadata for i18n interpolation
      const description = String(currentT(event.message, event.metadata || {}));

      // Prepare toast config
      const toastConfig = {
        title,
        description,
        duration: 5000,
      };

      // Show toast with action button if actionUrl present
      // TODO Sprint #9 - Punto 2: Navegación desde actionUrl
      if (event.actionUrl) {
        Object.assign(toastConfig, {
          action: React.createElement(
            'button',
            {
              className: 'text-sm font-medium underline',
              onClick: () => {
                // Validate that actionUrl is internal route (starts with /)
                if (event.actionUrl!.startsWith('/')) {
                  currentNavigate(event.actionUrl!);
                } else {
                  console.warn('[NotificationObserver] Ignoring external actionUrl:', event.actionUrl);
                }
              }
            },
            currentT('common.view')
          )
        });
      }

      // Call toast method directly (cannot use bracket notation with TypeScript)
      switch (toastVariant) {
        case 'success':
          toast.success(toastConfig);
          break;
        case 'warning':
          toast.warning(toastConfig);
          break;
        case 'error':
          toast.error(toastConfig);
          break;
        case 'info':
          toast.info(toastConfig);
          break;
      }

      console.log('✅ [NotificationObserver] Cache invalidated + Toast shown');
    });

    // Cleanup ONLY when component unmounts (MainLayout unmounts = logout/app close)
    return () => {
      console.log('[NotificationObserver] 🔌 UNMOUNTING - Closing SSE connection');
      unsubscribe();
      sseClient.disconnect();
    };
  }, []); // ⚠️ CRITICAL: Empty array = mount/unmount only, prevents reconnection loop

  // TODO Sprint #10 - Punto 4: Multi-Tab Coordination
  // Implementar coordinación localStorage para mostrar toast solo en tab activa
  // Strategy:
  // 1. localStorage.setItem('last_notification_toast', Date.now() + notificationId)
  // 2. window.addEventListener('storage', checkIfOtherTabHandled)
  // 3. Solo mostrar toast si no hay otra tab que ya lo mostró (<500ms)
  //
  // Benefits:
  // - Evita toasts duplicados en múltiples tabs
  // - Mantiene sincronización de cache en todas las tabs
  // - UX más limpia para usuarios con múltiples tabs abiertas

  // Hook doesn't return anything - side effects only
}
