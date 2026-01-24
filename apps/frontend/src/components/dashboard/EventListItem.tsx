import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { RecentMachineEventDTO } from "@packages/contracts";

interface EventListItemProps {
  event: RecentMachineEventDTO;
  style?: React.CSSProperties;
}

/**
 * EventListItem - Sprint #12 (Bundle 12)
 *
 * Card individual para mostrar un evento de máquina reciente en el carousel.
 *
 * Features:
 * - Badge de severidad (BAJO/MEDIO/ALTO/CRÍTICO) con color visual
 * - Info de máquina (nombre + tipo)
 * - Tipo de evento con descripción
 * - Fecha formateada con date-fns
 * - Navegación al detalle de la máquina
 *
 * UI: Card con ancho fijo (280px), altura auto, clickeable
 */
export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  style,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/machines/${event.machine.id}`);
  };

  const formattedDate = format(
    new Date(event.createdAt),
    "d 'de' MMMM, yyyy 'a las' HH:mm",
    { locale: es },
  );

  // Mapeo de severidad a colores
  const getSeverityBadge = (severity: string | undefined) => {
    const severityMap: Record<string, { color: string; label: string }> = {
      LOW: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: t("dashboard.events.severity.low"),
      },
      MEDIUM: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: t("dashboard.events.severity.medium"),
      },
      HIGH: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: t("dashboard.events.severity.high"),
      },
      CRITICAL: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: t("dashboard.events.severity.critical"),
      },
    };

    return severityMap[severity || "LOW"] || severityMap.LOW;
  };

  const severityBadge = getSeverityBadge(event.eventType.severity);

  return (
    <div
      onClick={handleClick}
      style={style}
      className="flex-shrink-0 w-[280px] bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
    >
      {/* Header con badge de severidad */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${severityBadge.color}`}
          >
            {severityBadge.label}
          </span>
        </div>
        <h3 className="text-base font-semibold text-gray-800 truncate">
          {event.machine.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {event.machine.machineType?.name || "Sin tipo"}
        </p>
      </div>

      {/* Body con tipo de evento */}
      <div className="px-4 py-3">
        <div className="flex items-start space-x-2">
          {/* Ícono de evento */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm">🔔</span>
          </div>

          {/* Información del evento */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 truncate">
              {event.eventType.name}
            </h4>
            {event.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer con fecha */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">📅 {formattedDate}</span>
          <svg
            className="w-4 h-4 text-gray-400"
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
        </div>
      </div>
    </div>
  );
};
