import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@store/AuthProvider';
import { sseClient } from '@services/sseClient';
import { QUERY_KEYS } from '@constants';
import { toast } from './useToast';
import { useBrowserNotification } from './useBrowserNotification';

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
 * 5. Handler: invalidate queries + show toast + native notification (if tab hidden)
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
  const browserNotification = useBrowserNotification();

  // Stabilize values with refs to prevent reconnection loop
  const userRef = useRef(user);
  const tokenRef = useRef(token);
  const queryClientRef = useRef(queryClient);
  const navigateRef = useRef(navigate);
  const tRef = useRef(t);
  const browserNotificationRef = useRef(browserNotification);
  
  // Store active notifications for cleanup (prevent memory leaks)
  const activeNotificationsRef = useRef<Notification[]>([]);

  // Update refs when values change (doesn't trigger useEffect)
  useEffect(() => {
    userRef.current = user;
    tokenRef.current = token;
    queryClientRef.current = queryClient;
    navigateRef.current = navigate;
    tRef.current = t;
    browserNotificationRef.current = browserNotification;
  }, [user, token, queryClient, navigate, t, browserNotification]);

  // SSE connection lifecycle - executes ONLY on mount/unmount
  useEffect(() => {
    // Only connect if user is authenticated
    if (!userRef.current || !tokenRef.current) {
      return;
    }

    // Connect SSE using ref values (stable across renders)
    sseClient.connect(tokenRef.current, userRef.current.id);

    // Subscribe to notification events
    const unsubscribe = sseClient.subscribe((event) => {
      // Use refs to access latest values without triggering reconnection
      const currentUser = userRef.current;
      const currentQueryClient = queryClientRef.current;
      const currentNavigate = navigateRef.current;
      const currentT = tRef.current;

      if (!currentUser) {
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
      const toastVariant: 'success' | 'warning' | 'error' | 'info' = event.notificationType || 'info';

      // Build toast title based on sourceType
      const title = event.sourceType
        ? currentT(`notifications.types.${event.sourceType.toLowerCase()}`, event.sourceType)
        : currentT('notifications.new');

      // Translate message with metadata for i18n interpolation
      const description = String(currentT(event.message, event.metadata || {}));

      // Prepare toast config
      const toastConfig = {
        title,
        description,
        duration: 5000,
      };

      // Show toast with action button if actionUrl present
      if (event.actionUrl) {
        // Validate actionUrl: must start with / and not contain suspicious patterns
        const isValidInternalUrl = /^\/[a-zA-Z0-9\-_/]*$/.test(event.actionUrl);
        
        if (isValidInternalUrl) {
          Object.assign(toastConfig, {
            action: React.createElement(
              'button',
              {
                className: 'text-sm font-medium underline',
                onClick: () => currentNavigate(event.actionUrl!)
              },
              currentT('common.view')
            )
          });
        } else {
          console.warn('[NotificationObserver] Invalid actionUrl rejected:', event.actionUrl);
        }
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

      // Show native browser notification if tab is in background
      // This avoids redundancy when user is actively viewing the app
      const currentBrowserNotif = browserNotificationRef.current;
      
      if (currentBrowserNotif.isGranted) {
        const notification = currentBrowserNotif.showNotification(title, {
          body: description,
          tag: event.notificationId, // Prevents duplicate notifications
          data: { actionUrl: event.actionUrl }, // Store for click handler
          requireInteraction: false, // Auto-dismiss after timeout
        });

        // Handle notification click: focus window and navigate if URL present
        if (notification) {
          // Store notification reference for cleanup
          activeNotificationsRef.current.push(notification);
          
          // Click handler with improved URL validation
          const clickHandler = () => {
            window.focus();
            const actionUrl = event.actionUrl;
            
            if (actionUrl) {
              // Same validation as toast action
              const isValidInternalUrl = /^\/[a-zA-Z0-9\-_/]*$/.test(actionUrl);
              
              if (isValidInternalUrl) {
                const currentNavigate = navigateRef.current;
                currentNavigate(actionUrl);
              } else {
                console.warn('[NotificationObserver] Invalid actionUrl in notification click:', actionUrl);
              }
            }
          };
          
          notification.addEventListener('click', clickHandler);
          
          // Auto-cleanup when notification closes
          notification.addEventListener('close', () => {
            const index = activeNotificationsRef.current.indexOf(notification);
            if (index > -1) {
              activeNotificationsRef.current.splice(index, 1);
            }
          });
        }
      }

      // TODO: Add multi-tab coordination to prevent notification spam
      // Could use BroadcastChannel API to signal other tabs that notification was shown
      // TODO: Add notification sound toggle in settings (play sound only if enabled)
      // TODO: Track notification click-through rate for analytics
    });

    // Cleanup ONLY when component unmounts (MainLayout unmounts = logout/app close)
    return () => {
      // Close all active notifications to prevent memory leaks
      activeNotificationsRef.current.forEach(notification => {
        notification.close();
      });
      activeNotificationsRef.current = [];
      
      // Disconnect SSE
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
