import React from 'react';
import { Link } from 'react-router-dom';
import { Card, BodyText, Badge, Button } from '@components/ui';
import { AlarmProgressIndicator, CreateEditAlarmModal, AlarmActionMenuModal } from '@components/maintenance';
import { useAlarmDetailViewModel } from '../../viewModels/maintenance/useAlarmDetailViewModel';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Edit, Trash2, Zap, Bell } from 'lucide-react';

/**
 * AlarmDetailScreen Component
 * 
 * Dedicated screen for viewing full alarm details via URL routing
 * Enables deep-linking from notifications: /machines/:machineId/maintenance-alarms/:alarmId
 * 
 * Converted from AlarmDetailModal to support:
 * - Direct navigation from notifications
 * - URL-based state (shareable links)
 * - Breadcrumb navigation
 * - Browser back/forward
 * 
 * Sprint #11: Full-screen layout with breadcrumbs and action buttons
 * 
 * Responsibilities:
 * - Render UI (header, breadcrumbs, alarm details, stats)
 * - Handle loading/error/empty states
 * - Delegate actions to ViewModel
 * 
 * Business logic is in useAlarmDetailViewModel
 * 
 * @example
 * URL: /machines/abc123/maintenance-alarms/xyz789
 * Renders: Full alarm detail with edit/delete actions
 */
export const AlarmDetailScreen: React.FC = () => {
  const vm = useAlarmDetailViewModel();

  // ========================
  // LOADING STATE
  // ========================
  
  if (vm.state.isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">{vm.t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // ERROR STATE
  // ========================
  
  if (vm.state.error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              {vm.t('errors.loadError')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {vm.state.error instanceof Error
                ? vm.state.error.message
                : vm.t('errors.unknownError')}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onPress={vm.actions.handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {vm.t('common.back')}
              </Button>
              <Button variant="filled" onPress={vm.actions.handleRetry}>
                {vm.t('common.retry')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // NOT FOUND STATE
  // ========================
  
  if (!vm.data.alarm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              {vm.t('maintenance.alarms.notFound')}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {vm.t('maintenance.alarms.notFoundDescription')}
            </p>
            <Button 
              variant="filled" 
              className="mt-6" 
              onPress={vm.actions.handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {vm.t('maintenance.alarms.backToList')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // MAIN RENDER
  // ========================
  
  const { alarm } = vm.data;

  return (
    <div className="container mx-auto px-4 py-6 space-y-2">
      {/* ========================
          HEADER & BREADCRUMBS
          ======================== */}
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t('navigation.machines')}
          </Link>
          <span>/</span>
          <Link 
            to={`/machines/${vm.state.machineId}`} 
            className="hover:text-foreground"
          >
            {vm.t('navigation.machineDetail')}
          </Link>
          <span>/</span>
          <Link 
            to={`/machines/${vm.state.machineId}/alarms`} 
            className="hover:text-foreground"
          >
            {vm.t('navigation.alarms')}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">
            {alarm.title}
          </span>
        </div>

        {/* Header with actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground truncate">
                {alarm.title}
              </h1>
              <Badge variant={alarm.isActive ? 'success' : 'secondary'}>
                {alarm.isActive
                  ? vm.t('maintenance.alarms.active')
                  : vm.t('maintenance.alarms.inactive')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {vm.t('maintenance.alarms.detailSubtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="default"
              onPress={vm.actions.handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {vm.t('common.back')}
            </Button>
            <Button
              variant="filled"
              size="default"
              onPress={vm.actions.handleOpenActionMenu}
            >
              <Zap className="w-4 h-4 mr-2" />
              {vm.t('maintenance.alarms.takeAction')}
            </Button>
            <Button
              variant="destructive"
              size="default"
              onPress={vm.actions.handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {vm.t('common.delete')}
            </Button>
            <Button
              variant="filled"
              size="default"
              onPress={vm.actions.handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              {vm.t('common.edit')}
            </Button>
          </div>
        </div>
      </div>

      {/* ========================
          MAIN CONTENT
          ======================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description Card */}
          {alarm.description && (
            <Card className="p-6">
              <BodyText weight="medium" className="mb-3">
                {vm.t('maintenance.alarms.description')}
              </BodyText>
              <BodyText className="text-muted-foreground whitespace-pre-line">
                {alarm.description}
              </BodyText>
            </Card>
          )}

          {/* Status Alert Cards */}
          {vm.data.isOverdue && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-7 w-7 text-destructive flex-shrink-0 mr-2" />
              <div>
                <BodyText weight="medium" className="text-destructive">
                  {vm.t('maintenance.alarms.overdue')}
                </BodyText>
                <BodyText size="small" className="text-destructive/80">
                  {vm.t('maintenance.alarms.overdueDescription')}
                </BodyText>
              </div>
            </div>
          )}
          
          {!vm.data.isOverdue && !vm.data.isApproaching && (
            <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle className="h-7 w-7 text-success flex-shrink-0 mr-2" />
              <div>
                <BodyText weight="medium" className="text-success">
                  {vm.t('maintenance.alarms.onTrack')}
                </BodyText>
                <BodyText size="small" className="text-success/80">
                  {vm.t('maintenance.alarms.onTrackDescription')}
                </BodyText>
              </div>
            </div>
          )}
          {vm.data.isApproaching && !vm.data.isOverdue && !vm.data.needsAttention && (
            <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Bell className="h-7 w-7 text-warning flex-shrink-0 mr-2" />
              <div>
                <BodyText weight="medium" className="text-warning">
                  {vm.t('maintenance.alarms.approaching')}
                </BodyText>
                <BodyText size="small" className="text-warning/80">
                  {vm.t('maintenance.alarms.approachingDescription')}
                </BodyText>
              </div>
            </div>
          )}
          {vm.data.needsAttention && !vm.data.isOverdue && (
            <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-7 w-7 text-warning flex-shrink-0 mr-2" />
              <div>
                <BodyText weight="medium" className="text-warning">
                  {vm.t('maintenance.alarms.triggered')}
                </BodyText>
                <BodyText size="small" className="text-warning/80">
                  {vm.t('maintenance.alarms.triggeredDescription')}
                </BodyText>
              </div>
            </div>
          )}
          {/* Progress Card */}
          <Card className="p-6">
            <BodyText weight="medium" className="mb-4">
              {vm.t('maintenance.alarms.progressTitle')}
            </BodyText>
            <AlarmProgressIndicator
              currentHours={alarm.accumulatedHours}
              intervalHours={alarm.intervalHours}
              isOverdue={vm.data.isOverdue}
            />
            
            {/* Progress Info */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {vm.t('maintenance.alarms.accumulated')}:
                </span>
                <span className="ml-2 font-medium">
                  {alarm.accumulatedHours}h
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {vm.t('maintenance.alarms.remaining')}:
                </span>
                <span className="ml-2 font-medium">
                  {vm.data.hoursRemaining}h
                </span>
              </div>
            </div>
          </Card>

          {/* Related Parts Card */}
          {alarm.relatedParts.length > 0 && (
            <Card className="p-6">
              <BodyText weight="medium" className="mb-3">
                {vm.t('maintenance.alarms.relatedParts')} ({alarm.relatedParts.length})
              </BodyText>
              <div className="flex flex-wrap gap-2">
                {alarm.relatedParts.map((part: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {part}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Stats Sidebar */}
        <div className="space-y-4">
          {/* Interval Stat */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <BodyText size="small" className="text-muted-foreground">
                {vm.t('maintenance.alarms.interval')}
              </BodyText>
            </div>
            <BodyText className="text-2xl font-bold">
              {vm.data.stats.intervalHours}h
            </BodyText>
          </Card>

          {/* Times Triggered Stat */}
          <Card className="p-4">
            <BodyText size="small" className="text-muted-foreground mb-2">
              {vm.t('maintenance.alarms.timesTriggered')}
            </BodyText>
            <BodyText className="text-2xl font-bold">
              {vm.data.stats.timesTriggered}x
            </BodyText>
          </Card>

          {/* Last Triggered Stat */}
          <Card className="p-4">
            <BodyText size="small" className="text-muted-foreground mb-2">
              {vm.t('maintenance.alarms.lastTriggered')}
            </BodyText>
            <BodyText className="text-lg font-medium">
              {vm.data.stats.lastTriggeredDate}
            </BodyText>
          </Card>

          {/* POST-MVP: Additional sidebar cards
           * - Related machine events count
           * - Maintenance history timeline link
           * - Average response time
           * - Cost tracking (if integrated)
           */}
        </div>
      </div>

      {/* ========================
          EDIT ALARM MODAL
          ======================== */}
      <CreateEditAlarmModal
        isOpen={vm.modals.edit.isOpen}
        onClose={vm.modals.edit.onClose}
        alarm={vm.modals.edit.alarm}
        machineId={vm.modals.edit.machineId}
      />

      {/* ========================
          ACTION MENU MODAL
          ======================== */}
      <AlarmActionMenuModal
        open={vm.modals.actionMenu.isOpen}
        onOpenChange={vm.modals.actionMenu.onOpenChange}
        onContactProvider={vm.modals.actionMenu.onContactProvider}
        onPostpone={vm.modals.actionMenu.onPostpone}
        onEditAlarm={vm.modals.actionMenu.onEditAlarm}
        onMarkCompleted={vm.modals.actionMenu.onMarkCompleted}
        onStopMachine={vm.modals.actionMenu.onStopMachine}
      />
    </div>
  );
};
