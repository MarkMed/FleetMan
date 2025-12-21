import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X } from 'lucide-react';
import { useBrowserNotification } from '@hooks/useBrowserNotification';
import { useLocalStorage } from '@hooks';
import { Card, Button } from '@components/ui';

/**
 * BrowserNotificationBanner - Permission request banner for native notifications
 * 
 * Shows a non-intrusive info banner asking users to enable browser notifications.
 * Only displays when:
 * - Browser supports Web Notifications API
 * - Permission is in 'default' state (not asked yet)
 * - User hasn't dismissed the banner
 * 
 * Features:
 * - Persists dismissal state in localStorage
 * - Auto-hides after permission granted
 * - Graceful degradation for unsupported browsers
 * - Fully internationalized
 * 
 * @example
 * ```tsx
 * <BrowserNotificationBanner />
 * ```
 */
export function BrowserNotificationBanner() {
  const { t } = useTranslation();
  const { 
    isSupported, 
    isDefault,
    requestPermission 
  } = useBrowserNotification();
  
  const [dismissed, setDismissed] = useLocalStorage('notification-banner-dismissed', false);

  // Don't show banner if:
  // - Browser doesn't support notifications
  // - Permission already granted or denied (not default)
  // - User dismissed the banner
  if (!isSupported || !isDefault || dismissed) {
    return null;
  }

  /**
   * Handle "Enable" button click
   * Requests permission and dismisses banner if granted
   */
  const handleEnable = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      // Permission granted - hide banner permanently
      setDismissed(true);
    }
    // If denied, keep banner visible (user can try again later)
    // If they deny permanently via browser, permission will be 'denied' and banner won't show
  };

  /**
   * Handle "Later" button click
   * Dismisses banner without requesting permission
   * User can manually enable from browser settings later
   */
  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="border-l-4 border-info bg-info/5">
      <div className="p-4 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Bell className="h-6 w-6 text-info" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {t('notifications.browser.permissionBanner.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('notifications.browser.permissionBanner.description')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="filled"
              size="sm"
              onPress={handleEnable}
              className="bg-info hover:bg-info/90"
            >
              {t('notifications.browser.permissionBanner.enable')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('notifications.browser.permissionBanner.dismiss')}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('notifications.browser.permissionBanner.close')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}

// TODO: iOS PWA detection and custom message
// Future enhancement: Detect if user is on iOS Safari (non-PWA) and show
// different message explaining they need to "Add to Home Screen" first
// Example:
// const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
// const isPWA = window.matchMedia('(display-mode: standalone)').matches;
// if (isIOS && !isPWA) {
//   return (
//     <Card className="border-l-4 border-warning bg-warning/5">
//       <p>{t('notifications.browser.permissionBanner.iosInstallRequired')}</p>
//     </Card>
//   );
// }

// TODO: Add to Settings screen
// Future enhancement: Create a toggle in user settings to re-enable this banner
// if user dismissed it but changed their mind later
// Settings option: "Show browser notification permission prompt"
