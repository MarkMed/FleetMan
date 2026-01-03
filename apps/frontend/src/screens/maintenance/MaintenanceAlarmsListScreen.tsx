import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heading1, BodyText, Button, Card } from '@components/ui';
import { Plus, AlertCircle, Bell } from 'lucide-react';
import { useMaintenanceAlarms } from '@hooks';
import { AlarmCard, CreateEditAlarmModal, AlarmDetailModal } from '@components/maintenance';
import type { MaintenanceAlarm } from '@contracts';

/**
 * MaintenanceAlarmsListScreen
 * 
 * Sprint #11: Displays maintenance alarms for a specific machine.
 * Shows alarm cards with progress indicators, filter by active/inactive.
 * Allows creating new alarms and viewing details.
 * 
 * Mock Data: Uses useMaintenanceAlarms hook with mock service
 * Real Integration (Sprint #12): Will connect to backend API
 * 
 * @example
 * ```tsx
 * // Route: /machines/:id/alarms
 * <Route path="/machines/:id/alarms" element={<MaintenanceAlarmsListScreen />} />
 * ```
 */
export function MaintenanceAlarmsListScreen() {
  const { id: machineId } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // ========================
  // STATE
  // ========================

  // Selected alarm for detail modal (POST-MVP Step 6)
  const [selectedAlarm, setSelectedAlarm] = useState<MaintenanceAlarm | null>(null);
  
  // Create/Edit modal state (Step 5)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<MaintenanceAlarm | null>(null);

  // ========================
  // DATA FETCHING
  // ========================

  // Fetch alarms (mock data for now)
  const { data, isLoading, error, refetch } = useMaintenanceAlarms(
    machineId,
    false // Get all alarms (we filter locally for Sprint #11)
  );

  // Mock: Current operating hours (will come from machine data in Sprint #12)
  const MOCK_CURRENT_OPERATING_HOURS = 1950;

  // ========================
  // COMPUTED DATA
  // ========================

  const alarms = data?.alarms || [];

  // ========================
  // HANDLERS
  // ========================

  const handleCreateAlarm = () => {
    setEditingAlarm(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAlarm = (alarm: MaintenanceAlarm) => {
    setEditingAlarm(alarm);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (alarm: MaintenanceAlarm) => {
    setSelectedAlarm(alarm);
  };

  // ========================
  // ERROR STATE
  // ========================

  if (error) {
    return (
      <div className="space-y-8">
        <Heading1 size="headline">{t('maintenance.alarms.title')}</Heading1>
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <BodyText className="text-destructive">
              {t('common.error')}
            </BodyText>
            <Button variant="outline" onPress={() => refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // LOADING STATE
  // ========================

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Heading1 size="headline">{t('maintenance.alarms.title')}</Heading1>
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

  if (alarms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/machines" className="hover:text-foreground">
            {t('machines.breadcrumb.machines')}
          </Link>
          <span>/</span>
          <Link to={`/machines/${machineId}`} className="hover:text-foreground">
            {t('machines.breadcrumb.detail')}
          </Link>
          <span>/</span>
          <span className="text-foreground">{t('machines.breadcrumb.alarms')}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <Heading1 size="headline" className="tracking-tight text-foreground">
              {t('maintenance.alarms.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {t('maintenance.alarms.subtitle')}
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
              {t('maintenance.alarms.empty.title')}
            </Heading1>
            <BodyText className="text-muted-foreground">
              {t('maintenance.alarms.empty.description')}
            </BodyText>
            <Button variant="filled" onPress={handleCreateAlarm} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t('maintenance.alarms.empty.action')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ========================
  // MAIN RENDER
  // ========================

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/machines" className="hover:text-foreground">
          {t('machines.breadcrumb.machines')}
        </Link>
        <span>/</span>
        <Link to={`/machines/${machineId}`} className="hover:text-foreground">
          {t('machines.breadcrumb.detail')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t('machines.breadcrumb.alarms')}</span>
      </div>

      {/* Header with Create Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            {t('maintenance.alarms.title')}
          </Heading1>
          <BodyText className="text-muted-foreground">
            {t('maintenance.alarms.subtitle')}
          </BodyText>
        </div>
        <Button variant="filled" onPress={handleCreateAlarm}>
          <Plus className="h-4 w-4 mr-2" />
          {t('maintenance.alarms.createAlarm')}
        </Button>
      </div>

      {/* Alarms Grid - Minimalist approach: show all alarms without filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alarms.map(alarm => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              currentOperatingHours={MOCK_CURRENT_OPERATING_HOURS}
              onViewDetails={handleViewDetails}
            />
          ))}
      </div>

      {/* Sprint #11 Step 5: CreateEditAlarmModal */}
      <CreateEditAlarmModal
        isOpen={isCreateModalOpen || !!editingAlarm}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAlarm(null);
        }}
        alarm={editingAlarm}
        machineId={machineId}
      />

      {/* Sprint #11 Refinement: AlarmDetailModal - Progressive Disclosure Pattern */}
      <AlarmDetailModal
        open={!!selectedAlarm}
        onOpenChange={(open) => !open && setSelectedAlarm(null)}
        alarm={selectedAlarm}
        currentOperatingHours={MOCK_CURRENT_OPERATING_HOURS}
        machineId={machineId}
        onEdit={handleEditAlarm}
      />

      {/* POST-MVP: Additional AlarmDetailModal features
        
        Toggle Status and Delete actions (requires mutations):
        
        const toggleMutation = useToggleAlarmStatus(machineId);
        const deleteMutation = useDeleteMaintenanceAlarm(machineId);
        
        Props to add:
          onToggleStatus={(alarmId: string, isActive: boolean) => 
            toggleMutation.mutate({ alarmId, isActive })
          }
          onDelete={(alarmId: string) => deleteMutation.mutate(alarmId)}
      */}
    </div>
  );
}

// ============================================
// POST-MVP: Enhanced Features (Commented)
// ============================================

/**
 * Stats Cards + Filters (Removed for minimalism)
 * 
 * Re-enable if machine has >5 alarms or user requests filtering.
 * Original implementation preserved in git history.
 * 
 * Features:
 * - Stats cards: Total/Active/Inactive with icons
 * - Filter buttons: All/Active/Inactive with count badges
 * - Local filtering with reactive state
 * 
 * Tradeoff: Saves ~180px vertical space at cost of discoverability
 */

/**
 * Bulk Actions
 * Select multiple alarms and activate/deactivate/delete at once
 * 
 * UI: Checkboxes on cards + floating action bar
 */
// const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);
// const handleBulkToggle = (isActive: boolean) => { }

/**
 * Sort Options
 * Sort alarms by: interval, times triggered, last triggered, status
 * 
 * UI: Dropdown "Ordenar por:"
 */
// const [sortBy, setSortBy] = useState<'interval' | 'timesTriggered' | 'lastTriggered'>('interval');

/**
 * Search/Filter
 * Search by title, filter by related parts, filter by overdue status
 * 
 * UI: Search input + advanced filters modal
 */
// const [searchTerm, setSearchTerm] = useState('');
// const [showOverdueOnly, setShowOverdueOnly] = useState(false);

/**
 * Alarm Templates
 * Load pre-configured alarms for common maintenance tasks
 * 
 * UI: Button "Cargar desde plantilla" → Opens template picker
 */
// const handleLoadTemplate = (template: AlarmTemplate) => { }
