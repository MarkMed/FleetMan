import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';
import { useNotificationsViewModel } from '../../viewModels/useNotificationsViewModel';

/**
 * NotificationsScreen: View Layer (MVVM-lite)
 * 
 * Responsibilities:
 * - Render UI based on ViewModel state
 * - Handle presentation logic (styles, formatting)
 * - Delegate business logic to ViewModel
 * 
 * Architecture:
 * - Imports ViewModel hook (useNotificationsViewModel)
 * - Destructures { state, data, actions }
 * - Renders JSX with minimal inline logic
 */

/**
 * Notification badge color mapping based on notification type
 * Pure presentation logic - stays in View
 */
const getNotificationStyles = (type: 'success' | 'warning' | 'error' | 'info') => {
  const styles = {
    success: {
      border: 'border-l-success',
      bg: 'bg-success/5',
      dot: 'bg-success',
      badge: 'text-success bg-success/10',
      label: 'ÉXITO',
    },
    warning: {
      border: 'border-l-warning',
      bg: 'bg-warning/5',
      dot: 'bg-warning',
      badge: 'text-warning bg-warning/10',
      label: 'ATENCIÓN',
    },
    error: {
      border: 'border-l-destructive',
      bg: 'bg-destructive/5',
      dot: 'bg-destructive',
      badge: 'text-destructive bg-destructive/10',
      label: 'CRÍTICO',
    },
    info: {
      border: 'border-l-info',
      bg: 'bg-info/5',
      dot: 'bg-info',
      badge: 'text-info bg-info/10',
      label: 'INFO',
    },
  };
  return styles[type];
};

/**
 * Format time ago in Spanish
 * Pure presentation logic - stays in View
 * TODO Sprint #11: Move to i18n for multi-language support
 */
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
};

export const NotificationsScreen: React.FC = () => {
  // ========================
  // ViewModel Integration
  // ========================
  const vm = useNotificationsViewModel();

  // ========================
  // Loading State
  // ========================
  if (vm.state.isFirstPageLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {vm.t('notifications.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t('notifications.subtitle')}
            </BodyText>
          </div>
        </div>
        <BodyText className="text-center text-muted-foreground">
          {vm.t('notifications.loading')}
        </BodyText>
      </div>
    );
  }

  // ========================
  // Error State
  // ========================
  if (vm.state.error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {vm.t('notifications.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t('notifications.subtitle')}
            </BodyText>
          </div>
        </div>
        <Card>
          <div className="p-6 text-center space-y-4">
            <BodyText className="text-destructive">
              {vm.t('notifications.error.fetchFailed')}
            </BodyText>
            <Button variant="outline" size="default" onPress={vm.actions.handleRetry}>
              {vm.t('common.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // Main Render
  // ========================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            {vm.t('notifications.title')}
          </Heading1>
          <BodyText className="text-muted-foreground">
            {vm.t('notifications.subtitle')}
          </BodyText>
        </div>
        <div className="flex gap-2">
          {/* TODO: Sprint #10 - Implement mark all as seen (requires backend endpoint) */}
          <Button variant="outline" size="default" disabled>
            {vm.t('notifications.markAllAsRead')}
          </Button>
          {/* TODO: Sprint #11 - Implement notification settings modal */}
          <Button variant="filled" size="default" disabled>
            {vm.t('notifications.configure')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">
              {vm.t('notifications.stats.total')}
            </BodyText>
            <Heading2 size="headline" weight="bold" className="text-foreground">
              {vm.data.totalCount}
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">
              {vm.t('notifications.stats.notifications')}
            </BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">
              {vm.t('notifications.stats.unread')}
            </BodyText>
            <Heading2 size="headline" weight="bold" className="text-warning">
              {vm.data.unreadCount}
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">
              {vm.t('notifications.stats.new')}
            </BodyText>
          </div>
        </Card>
        
        {/* TODO: Sprint #11 - Implement critical count (requires backend filter/aggregation) */}
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">
              {vm.t('notifications.stats.critical')}
            </BodyText>
            <Heading2 size="headline" weight="bold" className="text-destructive">
              -
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">
              {vm.t('notifications.stats.requireAttention')}
            </BodyText>
          </div>
        </Card>
        
        {/* TODO: Sprint #11 - Implement this week count (requires backend date filter) */}
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">
              {vm.t('notifications.stats.thisWeek')}
            </BodyText>
            <Heading2 size="headline" weight="bold" className="text-info">
              -
            </Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">
              {vm.t('notifications.stats.notifications')}
            </BodyText>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 border-b border-border">
              <Heading2 size="large" weight="bold">
                {vm.t('notifications.allNotifications')}
              </Heading2>
            </div>
            
            <div className="divide-y divide-border">
              {/* Empty State */}
              {vm.data.notifications.length === 0 && (
                <div className="p-12 text-center">
                  <BodyText className="text-muted-foreground mb-2">
                    {vm.t('notifications.empty.title')}
                  </BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    {vm.t('notifications.empty.description')}
                  </BodyText>
                </div>
              )}

              {/* Notification Items */}
              {vm.data.notifications.map((notification: any) => {
                const styles = getNotificationStyles(notification.notificationType);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 ${styles.bg} border-l-4 ${styles.border} ${
                      !notification.wasSeen ? 'opacity-100' : 'opacity-60'
                    } cursor-pointer hover:bg-muted/50`}
                    role="button"
                    tabIndex={0}
                    onClick={() => vm.actions.handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        vm.actions.handleNotificationClick(notification);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 ${styles.dot} rounded-full`}></div>
                          <h4 className="font-medium text-foreground">
                            {String(vm.t(notification.message, notification.metadata || {}))}
                          </h4>
                          <span className={`text-xs ${styles.badge} px-2 py-1 rounded`}>
                            {styles.label}
                          </span>
                          {!notification.wasSeen && (
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                              {vm.t('notifications.unread')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{formatTimeAgo(notification.notificationDate)}</span>
                          {notification.sourceType && (
                            <span>{notification.sourceType}</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-foreground ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          vm.actions.handleMarkAsSeen(notification.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {vm.data.hasMore && (
              <div className="p-4 border-t border-border">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="default"
                    onPress={vm.actions.handleLoadMore}
                    disabled={vm.state.isLoading}
                  >
                    {vm.state.isLoading 
                      ? vm.t('notifications.loading') 
                      : vm.t('notifications.loadMore')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {vm.t('notifications.filters')}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {vm.t('notifications.status')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  value={vm.state.onlyUnread ? 'unread' : 'all'}
                  onChange={(e) => vm.actions.handleFilterChange(e.target.value as 'all' | 'unread')}
                >
                  <option value="all">{vm.t('notifications.all')}</option>
                  <option value="unread">{vm.t('notifications.unread')}</option>
                </select>
              </div>

              {/* TODO: Sprint #11 - Implement notification type filter (requires backend sourceType filter) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {vm.t('notifications.type')}
                </label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  disabled
                >
                  <option>{vm.t('notifications.all')}</option>
                  <option>QUICKCHECK</option>
                  <option>EVENT</option>
                  <option>MAINTENANCE</option>
                  <option>SYSTEM</option>
                </select>
              </div>
            </div>
          </div>

          {/* TODO: Sprint #11 - Implement notification settings persistence */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {vm.t('notifications.configure')}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked disabled />
                <span className="text-sm text-foreground">Notificaciones por email</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked disabled />
                <span className="text-sm text-foreground">Alertas críticas inmediatas</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" disabled />
                <span className="text-sm text-foreground">Recordatorios de mantenimiento</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked disabled />
                <span className="text-sm text-foreground">Notificaciones de chequeos</span>
              </label>
            </div>

            <button
              className="w-full mt-4 border border-border py-2 px-4 rounded-lg hover:bg-muted"
              disabled
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};