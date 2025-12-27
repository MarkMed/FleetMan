import React from "react";
import { Card, BodyText, Heading3 } from "@components/ui";
import { Calendar, User, Cpu } from "lucide-react";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";
import type { MachineEvent } from "@services/api/machineEventService";

/**
 * EventItem Component
 *
 * Displays a single machine event in a card.
 * Shows: type badge, title, description (truncated), timestamp, system/manual indicator.
 *
 * Features:
 * - Auto-translates system event titles (when title matches i18n key pattern)
 * - Manual events show title as-is (user-entered text)
 * - Dual border colors: info (system) vs success (manual)
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
  const { t } = useTranslation();

  /**
   * Helper: Detecta si el título es una key de i18n y la traduce
   *
   * Sistema de eventos del backend:
   * - Eventos del sistema usan keys: "notification.quickcheck.completed.approved"
   * - Frontend traduce a: "machines.events.systemEvents.quickcheck.completed.approved"
   *
   * @param title - Título del evento (puede ser key o texto libre)
   * @returns Título traducido si es key de sistema, o texto original si es manual
   */
  const getDisplayTitle = (title: string): string => {
    // Si el evento es del sistema y el título parece una key de i18n (contiene 'notification.')
    if (event.isSystemGenerated && title.startsWith("notification.")) {
      // Convertir key de backend a key de frontend
      // "notification.quickcheck.completed.approved" → "machines.events.systemEvents.quickcheck.completed.approved"
      const frontendKey = title.replace(
        "notification.",
        "machines.events.systemEvents."
      );

      // Intentar traducir
      const translated = t(frontendKey, { defaultValue: "" });

      // Si la traducción existe (no retornó vacío ni la key), usarla
      if (translated && translated !== frontendKey) {
        return translated;
      }
    }

    // Si no es evento del sistema o no tiene traducción, retornar título original
    return title;
  };

  const displayTitle = getDisplayTitle(event.title);

  const getDisplayDescription = (
    description: string | undefined
  ): string | undefined => {
    // Si el evento es del sistema y la descripción parece una key de i18n
    if (
      event.isSystemGenerated &&
      description &&
      description.startsWith("notification.")
    ) {
      // Convertir key de backend a key de frontend
      // NOTA: El backend ya incluye .description en la key, no duplicar
      const frontendKey = description.replace(
        "notification.",
        "machines.events.systemEvents."
      );

      // Intentar traducir
      const translated = t(frontendKey, { defaultValue: "" });

      // Si la traducción existe, usarla
      if (translated && translated !== frontendKey) {
        return translated;
      }
    }
    // Retornar descripción original si no es evento del sistema o no tiene traducción
    return description;
  };

  const displayDescription = getDisplayDescription(event.description);

  const formattedDate = new Date(event.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Truncate description to 150 chars
  const truncatedDescription =
    displayDescription && displayDescription.length > 150
      ? `${displayDescription.substring(0, 150)}...`
      : displayDescription;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        "border-l-4",
        event.isSystemGenerated ? "border-l-info" : "border-l-success"
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        {/* Header: Type badge + Title */}
        <div className="flex items-start justify-between gap-3">
          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>

          {/* System/Manual Badge */}
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0",
              event.isSystemGenerated
                ? "bg-info/10 text-info"
                : "bg-success/10 text-success"
            )}
          >
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
        <div className="flex-1 min-w-0">
          <Heading3
            size="regular"
            className="font-semibold text-foreground truncate"
          >
            {displayTitle}
          </Heading3>
        </div>

        {/* Description (truncated) */}
        {truncatedDescription && (
          <BodyText size="small" className="text-muted-foreground line-clamp-2">
            {truncatedDescription}
          </BodyText>
        )}
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
