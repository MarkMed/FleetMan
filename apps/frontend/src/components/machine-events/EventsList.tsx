import React from 'react';
import { useTranslation } from 'react-i18next';
import { BodyText } from '@components/ui';
import { FileX } from 'lucide-react';
import type { MachineEvent } from '@services/api/machineEventService';
import { EventItem } from './EventItem';

/**
 * EventsList Component
 * 
 * Displays a list of machine events with empty state.
 * Pure presentation component - receives props from parent.
 * 
 * @param events - Array of machine events
 * @param onEventClick - Callback when event is clicked
 * @param isLoading - Loading state
 * 
 * @example
 * ```tsx
 * <EventsList
 *   events={vm.data.events}
 *   onEventClick={vm.actions.handleEventClick}
 *   isLoading={vm.state.isLoading}
 * />
 * ```
 */

interface EventsListProps {
  events: MachineEvent[];
  onEventClick: (event: MachineEvent) => void;
  isLoading?: boolean;
}

export function EventsList({ events, onEventClick, isLoading }: EventsListProps) {
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FileX className="h-16 w-16 text-muted-foreground mb-4" />
        <BodyText className="text-muted-foreground mb-2">
          {t('machines.events.empty.title')}
        </BodyText>
        <BodyText size="small" className="text-muted-foreground">
          {t('machines.events.empty.description')}
        </BodyText>
      </div>
    );
  }

  // Events list
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onClick={() => onEventClick(event)}
        />
      ))}
    </div>
  );
}
