import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heading1, BodyText, Button, Card, Badge } from '@components/ui';
import { Plus, AlertCircle, Bell, BellOff } from 'lucide-react';
import { useMaintenanceAlarms } from '@hooks';
import { AlarmCard, CreateEditAlarmModal } from '@components/maintenance';
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

  // Filter state: 'all' | 'active' | 'inactive'
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Selected alarm for detail modal (Step 6)
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
  
  // Filter alarms based on selected status
  const filteredAlarms = alarms.filter(alarm => {
    if (filterStatus === 'active') return alarm.isActive;
    if (filterStatus === 'inactive') return !alarm.isActive;
    return true; // 'all'
  });

  // Stats
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter(a => a.isActive).length;
  const inactiveAlarms = alarms.filter(a => !a.isActive).length;

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
      <div className="space-y-8">
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
    <div className="space-y-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="small" className="text-muted-foreground">
                {t('maintenance.alarms.stats.total')}
              </BodyText>
              <Heading1 size="large" className="mt-1">
                {totalAlarms}
              </Heading1>
            </div>
            <Bell className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="small" className="text-muted-foreground">
                {t('maintenance.alarms.stats.active')}
              </BodyText>
              <Heading1 size="large" className="mt-1 text-success">
                {activeAlarms}
              </Heading1>
            </div>
            <Bell className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <BodyText size="small" className="text-muted-foreground">
                {t('maintenance.alarms.stats.inactive')}
              </BodyText>
              <Heading1 size="large" className="mt-1 text-muted-foreground">
                {inactiveAlarms}
              </Heading1>
            </div>
            <BellOff className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'filled' : 'outline'}
          size="sm"
          onPress={() => setFilterStatus('all')}
        >
          {t('maintenance.alarms.showAll')}
          <Badge variant="secondary" className="ml-2">
            {totalAlarms}
          </Badge>
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'filled' : 'outline'}
          size="sm"
          onPress={() => setFilterStatus('active')}
        >
          {t('maintenance.alarms.showActive')}
          <Badge variant="secondary" className="ml-2">
            {activeAlarms}
          </Badge>
        </Button>
        <Button
          variant={filterStatus === 'inactive' ? 'filled' : 'outline'}
          size="sm"
          onPress={() => setFilterStatus('inactive')}
        >
          {t('maintenance.alarms.showInactive')}
          <Badge variant="secondary" className="ml-2">
            {inactiveAlarms}
          </Badge>
        </Button>
      </div>

      {/* Alarms Grid */}
      {filteredAlarms.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <BellOff className="h-12 w-12 text-muted-foreground" />
            <BodyText className="text-muted-foreground">
              {filterStatus === 'active' 
                ? t('maintenance.alarms.empty.title') 
                : `No hay alarmas ${filterStatus === 'inactive' ? 'inactivas' : 'en esta categoría'}`
              }
            </BodyText>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlarms.map(alarm => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              currentOperatingHours={MOCK_CURRENT_OPERATING_HOURS}
              onClick={handleViewDetails}
            />
          ))}
        </div>
      )}

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

      {/* TODO Sprint #11 Step 6: AlarmDetailModal */}
      {/* <AlarmDetailModal
        isOpen={!!selectedAlarm}
        onClose={() => setSelectedAlarm(null)}
        alarm={selectedAlarm}
        machineId={machineId}
        onEdit={handleEditAlarm}
      /> */}
    </div>
  );
}

// ============================================
// POST-MVP: Enhanced Features (Commented)
// ============================================

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
