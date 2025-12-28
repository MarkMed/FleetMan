import React from 'react';
import { useParams } from 'react-router-dom';
import { Heading1, BodyText, Button, Card } from '@components/ui';
import { Plus, AlertCircle } from 'lucide-react';
import { useMachineEventsViewModel } from '../../viewModels/machines/useMachineEventsViewModel';
import {
  EventsList,
  EventFilters,
  EventDetailModal,
  ReportEventModal,
} from '@components/machine-events';

/**
 * MachineEventsScreen: View Layer (MVVM-lite)
 * 
 * Displays full event history for a machine with filters and pagination.
 * Allows users to report new manual events.
 * 
 * Responsibilities:
 * - Render UI based on ViewModel state
 * - Handle presentation logic (styles, layout)
 * - Delegate business logic to ViewModel
 * 
 * @example
 * ```tsx
 * // Route: /machines/:id/events
 * <Route path="/machines/:id/events" element={<MachineEventsScreen />} />
 * ```
 */
export function MachineEventsScreen() {
  const { id: machineId } = useParams<{ id: string }>();
  const vm = useMachineEventsViewModel(machineId);

  // ========================
  // Error State
  // ========================
  if (vm.state.error) {
    return (
      <div className="space-y-8">
        <Heading1 size="headline">{vm.t('machines.events.title')}</Heading1>
        <Card className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <BodyText className="text-destructive">
              {vm.t('machines.events.error.fetchFailed')}
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
  // Main Render
  // ========================
  return (
    <div className="space-y-3 max-w-full overflow-x-hidden">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            {vm.t('machines.events.title')}
          </Heading1>
          <BodyText className="text-muted-foreground">
            {vm.t('machines.events.subtitle')}
          </BodyText>
        </div>

        {/* Report Event Button */}
        <Button
          variant="filled"
          onPress={vm.actions.handleOpenReportModal}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          {vm.t('machines.events.reportEvent')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <BodyText size="small" className="text-muted-foreground mb-1">
            {vm.t('machines.events.stats.total')}
          </BodyText>
          <Heading1 size="headline" className="text-foreground">
            {vm.data.totalCount}
          </Heading1>
        </Card>

        <Card className="p-4">
          <BodyText size="small" className="text-muted-foreground mb-1">
            {vm.t('machines.events.stats.manual')}
          </BodyText>
          <Heading1 size="headline" className="text-warning">
            {vm.data.manualCount}
          </Heading1>
        </Card>

        <Card className="p-4">
          <BodyText size="small" className="text-muted-foreground mb-1">
            {vm.t('machines.events.stats.system')}
          </BodyText>
          <Heading1 size="headline" className="text-info">
            {vm.data.systemCount}
          </Heading1>
        </Card>
      </div>

      {/* Filters */}
      <EventFilters
        filters={vm.state.filters}
        onFiltersChange={vm.actions.handleFiltersChange}
        onClear={vm.actions.handleClearFilters}
      />

      {/* Events List */}
      <Card className="p-4">
        <EventsList
          events={vm.data.events}
          onEventClick={vm.actions.handleEventClick}
          isLoading={vm.state.isFirstPageLoading}
        />

        {/* Load More Button */}
        {vm.data.hasMore && !vm.state.isLoading && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onPress={vm.actions.handleLoadMore}
              disabled={vm.state.isLoading}
            >
              {vm.t('common.loadMore')}
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {vm.data.events.length > 0 && (
          <div className="mt-4 text-center">
            <BodyText size="small" className="text-muted-foreground">
              {vm.t('machines.events.showing', {
                count: vm.data.events.length,
                total: vm.data.totalCount,
              })}
            </BodyText>
          </div>
        )}
      </Card>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={vm.state.selectedEvent}
        onClose={vm.actions.handleCloseDetail}
      />

      {/* Report Event Modal */}
      <ReportEventModal
        isOpen={vm.state.isReportModalOpen}
        machineId={machineId!}
        onClose={vm.actions.handleCloseReportModal}
        createEventMutation={vm.mutations.createEvent}
        eventTypes={vm.data.eventTypes}
        isLoadingEventTypes={vm.state.isLoadingEventTypes}
        onCreateEventType={vm.actions.handleCreateEventType}
        isCreatingEventType={vm.mutations.createEventType.isPending}
      />
    </div>
  );
}
