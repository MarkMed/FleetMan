import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, BodyText, Heading2, Card } from '@components/ui';
import { Calendar, User, Cpu, FileJson } from 'lucide-react';
import { cn } from '@utils/cn';
import type { MachineEvent } from '@services/api/machineEventService';

/**
 * EventDetailModal Component
 * 
 * Modal displaying full details of a machine event.
 * Shows: title, description, type, timestamp, creator, metadata (JSON).
 * 
 * @param event - Machine event to display (null = closed)
 * @param onClose - Callback to close modal
 * 
 * @example
 * ```tsx
 * <EventDetailModal
 *   event={vm.state.selectedEvent}
 *   onClose={vm.actions.handleCloseDetail}
 * />
 * ```
 */

interface EventDetailModalProps {
  event: MachineEvent | null;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const { t } = useTranslation();

  if (!event) return null;

  /**
   * Helper: Traduce título/descripción de eventos del sistema
   * 
   * NOTA: El backend ya incluye .description en las keys de descripción,
   * por ejemplo: "notification.quickcheck.completed.approved.description"
   * No necesitamos agregar el sufijo aquí.
   * 
   * @param text - Texto que puede ser key o texto libre (puede ser undefined)
   * @returns Texto traducido o texto original
   */
  const getTranslatedText = (text: string | undefined): string => {
    // Si no hay texto, retornar string vacío
    if (!text) return '';
    
    // Si el evento es del sistema y el texto parece una key de i18n
    if (event.isSystemGenerated && text.startsWith('notification.')) {
      // Convertir key de backend a key de frontend
      // Backend: "notification.quickcheck.completed.approved"
      // Frontend: "machines.events.systemEvents.quickcheck.completed.approved"
      const frontendKey = text.replace('notification.', 'machines.events.systemEvents.');
      
      // Intentar traducir
      const translated = t(frontendKey, { defaultValue: '' });
      
      // Si la traducción existe, usarla
      if (translated && translated !== frontendKey) {
        return translated;
      }
    }
    
    // Retornar texto original si no es evento del sistema o no tiene traducción
    return text;
  };

  const displayTitle = getTranslatedText(event.title);
  const displayDescription = getTranslatedText(event.description);

  const formattedDate = new Date(event.createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal open={!!event} onOpenChange={(open) => !open && onClose()}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Heading2 size="headline" className="text-foreground mb-2">
              {displayTitle}
            </Heading2>
            
            {/* System/Manual Badge */}
            <div className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
              event.isSystemGenerated
                ? 'bg-info/10 text-info'
                : 'bg-success/10 text-success'
            )}>
              {event.isSystemGenerated ? (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>{t('machines.events.systemGenerated')}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{t('machines.events.manualReport')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-4 bg-muted/30">
          <BodyText className="text-foreground whitespace-pre-wrap">
            {displayDescription}
          </BodyText>
        </Card>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Timestamp */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              <span>{t('machines.events.createdAt')}</span>
            </div>
            <BodyText className="font-medium">{formattedDate}</BodyText>
          </div>

          {/* Creator (if manual) */}
          {!event.isSystemGenerated && event.creator && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <User className="h-4 w-4" />
                <span>{t('machines.events.reportedBy')}</span>
              </div>
              <BodyText className="font-medium">{event.creator.name}</BodyText>
            </div>
          )}
        </div>

        {/* Metadata JSON (if present) */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <FileJson className="h-4 w-4" />
              <span>{t('machines.events.metadata')}</span>
            </div>
            <Card className="p-3 bg-muted/30 overflow-auto max-h-60">
              <pre className="text-xs text-foreground">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onPress={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// TODO: Strategic feature - Edit metadata button
// Add "Edit Metadata" button (only for manual events by creator):
// <Button
//   variant="outline"
//   onPress={handleEditMetadata}
//   disabled={event.isSystemGenerated || event.createdBy !== currentUserId}
// >
//   {t('machines.events.editMetadata')}
// </Button>
//
// Opens modal with JSON editor (monaco or textarea) to update metadata
