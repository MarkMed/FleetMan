import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heading1, BodyText, Button, Card } from '@components/ui';
import { Plus, AlertCircle, Bell } from 'lucide-react';
import { AlarmCard, CreateEditAlarmModal } from '@components/maintenance';
import { useMaintenanceAlarmsViewModel } from '../../viewModels/maintenance/useMaintenanceAlarmsViewModel';
import type { MaintenanceAlarm } from '@contracts';

/**
 * MaintenanceAlarmsListScreen (View Layer - MVVM)
 * 
 * Sprint #11: Displays maintenance alarms for a specific machine.
 * Shows alarm cards with progress indicators.
 * Allows creating new alarms and viewing details.
 * 
 * Architecture:
 * - View Layer: Only rendering and UI structure (this file)
 * - Business Logic: Handled by useMaintenanceAlarmsViewModel
 * - Data Layer: API calls via maintenanceAlarmService
 * 
 * Pattern:
 * - Consumes ViewModel via useMaintenanceAlarmsViewModel(machineId)
 * - NO business logic in this component
 * - Renders based on ViewModel state/data/actions
 * 
 * @example
 * ```tsx
 * // Route: /machines/:id/alarms
 * <Route path="/machines/:id/alarms" element={<MaintenanceAlarmsListScreen />} />
 * ```
 */
export function MaintenanceAlarmsListScreen() {
  const { id: machineId } = useParams<{ id: string }>();

  // ========================
  // ViewModel (Business Logic)
  // ========================
  
  const vm = useMaintenanceAlarmsViewModel(machineId);

  // ========================
  // RENDER SECTIONS
  // ========================

  // Determine which content to show based on state
  let content;

  // ========================
  // ERROR STATE
  // ========================

  if (vm.state.error) {
    content = (
      <div className="space-y-8">
        <Heading1 size="headline">{vm.t('maintenance.alarms.title')}</Heading1>
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <BodyText className="text-destructive">
              {vm.t('common.error')}
            </BodyText>
            <Button variant="outline" onPress={vm.actions.handleRetry}>
              {vm.t('common.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // LOADING STATE
  // ========================

  else if (vm.state.isLoading) {
    content = (
      <div className="space-y-8">
        <Heading1 size="headline">{vm.t('maintenance.alarms.title')}</Heading1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ========================
  // EMPTY STATE
  // ========================

  else if (vm.data.isEmpty) {
    content = (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t('machines.breadcrumb.machines')}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {vm.t('machines.breadcrumb.detail')}
          </Link>
          <span>/</span>
          <span className="text-foreground">{vm.t('machines.breadcrumb.alarms')}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {vm.t('maintenance.alarms.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t('maintenance.alarms.subtitle')}
            </BodyText>
          </div>
        </div>

        {/* Empty State Card */}
        <Card className="p-12">
          <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
            <div className="rounded-full bg-primary/10 p-6">
              <Bell className="h-16 w-16 text-primary" />
            </div>
            <Heading1 size="headline" className="text-foreground">
              {vm.t('maintenance.alarms.empty.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t('maintenance.alarms.empty.description')}
            </BodyText>
            <Button variant="filled" onPress={vm.actions.handleCreateAlarm} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {vm.t('maintenance.alarms.empty.action')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // MAIN RENDER (Alarms List)
  // ========================

  else {
    content = (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {vm.t('machines.breadcrumb.machines')}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {vm.t('machines.breadcrumb.detail')}
          </Link>
          <span>/</span>
          <span className="text-foreground">{vm.t('machines.breadcrumb.alarms')}</span>
        </div>

        {/* Header with Create Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {vm.t('maintenance.alarms.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {vm.t('maintenance.alarms.subtitle')}
            </BodyText>
          </div>
          <Button variant="filled" onPress={vm.actions.handleCreateAlarm}>
            <Plus className="h-4 w-4 mr-2" />
            {vm.t('maintenance.alarms.createAlarm')}
          </Button>
        </div>

        {/* Alarms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vm.data.alarms.map((alarm: MaintenanceAlarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              currentOperatingHours={vm.data.currentOperatingHours}
              machineId={machineId!}
            />
          ))}
        </div>

        {/* POST-MVP: Keep AlarmDetailModal for quick preview feature
         * Add optional modal view alongside screen navigation
         * Use case: Quick peek without leaving list context
         * 
         * Implementation:
         * - Add state: const [previewAlarmId, setPreviewAlarmId] = useState<string | null>(null);
         * - Add onQuickPreview handler in AlarmCard (right-click or hover preview)
         * - Render modal conditionally: {previewAlarmId && <AlarmDetailModal ... />}
         * - Benefits: Fast preview for experienced users, full screen for deep work
         */}
      </div>
    );
  }

  // ========================
  // FINAL RENDER
  // Always render modal regardless of content state
  // ========================

  return (
    <>
      {content}
      
      {/* Create/Edit Alarm Modal - Always rendered */}
      <CreateEditAlarmModal
        isOpen={vm.modals.create.isOpen}
        onClose={vm.modals.create.onClose}
        alarm={vm.modals.create.alarm}
        machineId={vm.modals.create.machineId}
      />
    </>
  );
}
