import React from 'react';
import { Card, BodyText, Heading3 } from '@components/ui';
import { Calendar, User, Cpu } from 'lucide-react';
import { cn } from '@utils/cn';
import type { MachineEvent } from '@services/api/machineEventService';

/**
 * EventItem Component
 * 
 * Displays a single machine event in a card.
 * Shows: type badge, title, description (truncated), timestamp, system/manual indicator.
 * 
 * @param event - Machine event object
 * @param onClick - Callback when card is clicked
 * 
 * @example
 * ```tsx
 * <EventItem
 *   event={event}
 *   onClick={() => handleClick(event)}
 * />
 * ```
 */

interface EventItemProps {
  event: MachineEvent;
  onClick: () => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  const formattedDate = new Date(event.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Truncate description to 150 chars
  const truncatedDescription = event.description && event.description.length > 150
    ? `${event.description.substring(0, 150)}...`
    : event.description;

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
        'border-l-4',
        event.isSystemGenerated ? 'border-l-info' : 'border-l-success'
      )}
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Header: Type badge + Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Heading3 size="regular" className="font-semibold text-foreground truncate">
              {event.title}
            </Heading3>
          </div>
          
          {/* System/Manual Badge */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0',
            event.isSystemGenerated
              ? 'bg-info/10 text-info'
              : 'bg-success/10 text-success'
          )}>
            {event.isSystemGenerated ? (
              <>
                <Cpu className="h-3 w-3" />
                <span>Sistema</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                <span>Manual</span>
              </>
            )}
          </div>
        </div>

        {/* Description (truncated) */}
        {truncatedDescription && (
          <BodyText size="small" className="text-muted-foreground line-clamp-2">
            {truncatedDescription}
          </BodyText>
        )}

        {/* Footer: Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </Card>
  );
}

// TODO: Strategic feature - Event actions menu (edit metadata, delete)
// Add a dropdown menu with actions:
// - View details (current onClick behavior)
// - Edit metadata (opens modal with JSON editor)
// - Delete event (only for manual events by creator, with confirmation)
// 
// Implementation:
// <DropdownMenu>
//   <DropdownMenuTrigger>
//     <MoreVertical className="h-4 w-4" />
//   </DropdownMenuTrigger>
//   <DropdownMenuContent>
//     <DropdownMenuItem onClick={onClick}>View Details</DropdownMenuItem>
//     {!event.isSystemGenerated && event.createdBy === currentUserId && (
//       <>
//         <DropdownMenuItem onClick={handleEditMetadata}>Edit Metadata</DropdownMenuItem>
//         <DropdownMenuItem onClick={handleDelete} className="text-destructive">
//           Delete Event
//         </DropdownMenuItem>
//       </>
//     )}
//   </DropdownMenuContent>
// </DropdownMenu>
