import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing browser native notifications (Web Notifications API)
 * 
 * Provides a simple interface to request notification permissions and show
 * native OS notifications. Works across all modern browsers with graceful
 * degradation for unsupported environments.
 * 
 * Features:
 * - Permission state management (default/granted/denied)
 * - Browser support detection
 * - Safe notification creation with permission checks
 * - Type-safe notification options
 * 
 * @returns {Object} Browser notification utilities
 * 
 * @example
 * ```tsx
 * const { isGranted, requestPermission, showNotification } = useBrowserNotification();
 * 
 * // Request permission
 * const handleEnable = async () => {
 *   const granted = await requestPermission();
 *   if (granted) {
 *     console.log('Notifications enabled!');
 *   }
 * };
 * 
 * // Show notification
 * if (isGranted) {
 *   showNotification('New Message', {
 *     body: 'You have a new notification',
 *     icon: '/logo.png'
 *   });
 * }
 * ```
 */
export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // Check browser support and initial permission state on mount
  useEffect(() => {
    console.log('[useBrowserNotification] Checking support...');
    console.log('[useBrowserNotification] window object exists:', typeof window !== 'undefined');
    console.log('[useBrowserNotification] "Notification" in window:', 'Notification' in window);
    console.log('[useBrowserNotification] Notification constructor:', typeof window.Notification);
    
    const supported = 'Notification' in window && typeof window.Notification !== 'undefined';
    console.log('[useBrowserNotification] Final supported value:', supported);
    
    setIsSupported(supported);
    
    if (supported) {
      const currentPermission = Notification.permission;
      console.log('[useBrowserNotification] Initial permission:', currentPermission);
      setPermission(currentPermission);
    } else {
      console.warn('[useBrowserNotification] ❌ Browser does NOT support Notifications API');
      console.warn('[useBrowserNotification] User Agent:', navigator.userAgent);
    }
  }, []);

  /**
   * Request notification permission from the user
   * 
   * Shows the browser's native permission dialog. Can only be called
   * in response to a user gesture (e.g., button click).
   * 
   * @returns Promise<boolean> - True if permission was granted
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('[useBrowserNotification] Notifications not supported in this browser');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('[useBrowserNotification] Failed to request permission:', error);
      return false;
    }
  }, [isSupported]);

  /**
   * Show a native browser notification
   * 
   * Creates and displays a system notification if permission is granted.
   * Returns null if permission is not granted or browser doesn't support it.
   * 
   * @param title - Notification title
   * @param options - NotificationOptions (body, icon, tag, etc.)
   * @returns Notification instance or null
   */
  const showNotification = useCallback((
    title: string, 
    options?: NotificationOptions
  ): Notification | null => {
    if (!isSupported) {
      console.warn('[useBrowserNotification] Notifications not supported');
      return null;
    }
    
    if (permission !== 'granted') {
      console.warn('[useBrowserNotification] Permission not granted, current:', permission);
      return null;
    }
    
    try {
      console.log('[useBrowserNotification] Creating notification:', { title, options });
      
      // Don't include icon/badge by default - can cause issues if paths don't exist
      const notification = new Notification(title, {
        requireInteraction: false, // Auto-dismiss after ~5 seconds
        ...options,
      });
      
      console.log('[useBrowserNotification] ✅ Notification created successfully');
      return notification;
    } catch (error) {
      console.error('[useBrowserNotification] ❌ Failed to show notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // TODO: Service Worker integration for offline notifications
  // Future enhancement: Register service worker to show notifications even when
  // the app is closed. Requires sw.js file and registration in index.html
  // Example:
  // const registerServiceWorker = async () => {
  //   if ('serviceWorker' in navigator) {
  //     const registration = await navigator.serviceWorker.register('/sw.js');
  //     return registration;
  //   }
  // };

  // TODO: iOS Safari PWA detection
  // iOS Safari only supports notifications when installed as PWA (Add to Home Screen)
  // Future enhancement: Detect iOS and show different message if not PWA
  // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  // const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  // const shouldShowIOSWarning = isIOS && !isPWA && permission === 'default';

  // TODO: Notification action buttons (Chrome/Edge only)
  // Future enhancement: Add action buttons to notifications
  // Example:
  // const showNotificationWithActions = (title: string, actions: NotificationAction[]) => {
  //   return showNotification(title, {
  //     body: 'Message',
  //     actions: [
  //       { action: 'view', title: 'View', icon: '/icons/view.png' },
  //       { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss.png' }
  //     ]
  //   });
  // };

  return {
    /** Current permission state: 'default' | 'granted' | 'denied' */
    permission,
    
    /** Whether the browser supports Web Notifications API */
    isSupported,
    
    /** True if user has granted notification permission */
    isGranted: permission === 'granted',
    
    /** True if user has denied notification permission */
    isDenied: permission === 'denied',
    
    /** True if permission has not been requested yet */
    isDefault: permission === 'default',
    
    /** Request notification permission from user */
    requestPermission,
    
    /** Show a native browser notification */
    showNotification,
  };
}
