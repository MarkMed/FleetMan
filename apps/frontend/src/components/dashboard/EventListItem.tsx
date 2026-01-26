import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { RecentMachineEventDTO } from "@packages/contracts";
import { BodyText, Card, Button } from "@components/ui";
import { AlertTriangle } from "lucide-react";

interface EventListItemProps {
  event: RecentMachineEventDTO;
  style?: React.CSSProperties;
}

const separatorClasses = "border-b border-border pb-2 border-b-gray-500/20";

/**
 * EventListItem - Sprint #12 (Bundle 12)
 *
 * Card para mostrar un evento de máquina reciente en el carousel del dashboard.
 * Diseño consistente con QuickCheckListItem para coherencia visual.
 *
 * Features:
 * - Diseño consistente con QuickCheckListItem
 * - Badge de tipo de evento (o "No especificado" si null)
 * - Info de máquina (serialNumber + nombre)
 * - Nombre del responsable que reportó
 * - Descripción truncada con dialog-style
 * - Fecha formateada
 * - Navegación al detalle de la máquina
 *
 * UI: Card con ancho fijo (280px), altura auto, hover effects
 */
export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  style,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/machines/${event.machine.id}`);
  };

  // Format date (formato corto para dashboard) - usa locale según idioma actual
  // Usa startsWith para manejar códigos regionales como 'es-ES', 'en-US', etc.
  const dateLocale = i18n.language.startsWith('es') ? es : enUS;
  const formattedDate = format(new Date(event.createdAt), "d MMM yyyy, HH:mm", {
    locale: dateLocale,
  });

  return (
    <Card
      className="flex flex-col flex-shrink-0 p-5 hover:shadow-lg transition-shadow min-w-[280px] max-w-[280px]"
      style={style}
    >
      {/* Header: Event Type Badge */}
      <div className="flex flex-col flex-wrap justify-between gap-2">
        <BodyText
          size="regular"
          weight="medium"
          className="flex flex-grow text-foreground justify-end"
        >
          {formattedDate}
        </BodyText>
        <BodyText
          size="medium"
          className="px-2.5 rounded-full flex-shrink-0 flex flex-row justify-center items-center -ml-1 bg-yellow-500 text-yellow-800 dark:bg-yellow-500/60 dark:text-yellow-300"
        >
          <AlertTriangle className="w-6 h-6 mr-1" />
          {event.eventType?.name || t("dashboard.events.eventType.unspecified")}
        </BodyText>
      </div>

      {/* Machine Info & Date */}
      <div
        className={`flex flex-col items-start justify-between ${separatorClasses} mt-2`}
      >
        <div className="w-full flex flex-col flex-wrap justify-center items-between mt-1 -gap-1">
          <BodyText size="medium" weight="medium" className="truncate">
            {event.machine.serialNumber}
          </BodyText>
          <BodyText
            size="medium"
            className="truncate flex justify-start w-full -mt-1"
          >
            {event.machine.name}
          </BodyText>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between mt-3">
        <div>
          {/* Event Title & Description (dialog-style) */}
          {(event.title || event.description) && (
            <div className="mb-3 flex flex-col justify-start mt-2">
              <div className="h-3 w-3 rotate-45 translate-y-[50%] translate-x-[20%] bg-gray-200 dark:bg-slate-700 border border-slate-500/50 z-0"></div>
              <div className="bg-gray-200 dark:bg-slate-700 border border-slate-500/50 rounded-lg p-3 rounded-tl-none border-t-0 z-10">
                {event.title && (
                  <BodyText
                    size="regular"
                    weight="medium"
                    className="text-foreground mb-1"
                  >
                    {event.title}
                  </BodyText>
                )}
                {event.description && (
                  <BodyText
                    size="regular"
                    className="text-muted-foreground line-clamp-3 leading-relaxed"
                  >
                    {event.description}
                  </BodyText>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer: View Machine Button */}
        <div>
          <Button
            onPress={handleClick}
            variant="outline"
            className="flex items-center justify-center w-full"
            aria-label={t("dashboard.events.viewMachine")}
          >
            <span>{t("dashboard.events.viewMachine")}</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
};
