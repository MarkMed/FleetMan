import { useTranslation } from "react-i18next";
import { useDragScroll } from "@hooks/useDragScroll";
import { EventListItem } from "./EventListItem";
import type { RecentMachineEventDTO } from "@packages/contracts";
import { Card, Heading2 } from "@components/ui";

interface EventWidgetProps {
  events: RecentMachineEventDTO[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore: boolean;
  error: Error | null;
  onLoadMore: () => void;
}

/**
 * EventWidget - Sprint #12 (Bundle 12)
 *
 * Widget contenedor para la sección de "Últimos Reportes de Eventos".
 *
 * Features:
 * - Carousel horizontal scrollable
 * - Botón "Ver más" para paginación incremental
 * - Empty state cuando no hay datos
 * - Loading state con skeleton placeholders
 * - Error state con mensaje de retry
 *
 * UI: Ancho completo, scroll horizontal con hide scrollbar, gap de 16px
 */
export const EventWidget: React.FC<EventWidgetProps> = ({
  events,
  isLoading,
  isLoadingMore = false,
  hasMore,
  error,
  onLoadMore,
}) => {
  const { t } = useTranslation();
  const scrollRef = useDragScroll<HTMLDivElement>();

  // Loading state inicial
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] h-[200px] bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Heading2>{t("dashboard.events.title")}</Heading2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-600 mb-4">{t("dashboard.events.error")}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <Card>
        <Heading2>{t("dashboard.events.title")}</Heading2>
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg mb-2">
            {t("dashboard.events.empty.title")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("dashboard.events.empty.description")}
          </p>
        </div>
      </Card>
    );
  }

  // Normal state con datos
  return (
    <Card
      className="bg-transparent overflow-visible shadow-none p-0 border-0"
      style={{ animation: `fadeSlideIn 0.3s ease-out ${0.1}s both` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Heading2>{t("dashboard.events.title")}</Heading2>
        <span className="text-sm text-gray-500">
          {t("dashboard.events.count", { count: events.length })}
        </span>
      </div>

      {/* Carousel horizontal scrollable con drag support */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
        >
          {events.map((event, index) => (
            <EventListItem
              key={`event-${event.id}-${index}`}
              event={event}
              style={{
                animation: `fadeSlideIn 0.3s ease-out ${(index % 5) * 0.16}s both`,
              }}
            />
          ))}

          {/* Botón "+ Más" como último item del carousel */}
          {hasMore && (
            <div className="flex-shrink-0 flex items-center justify-center w-[100px] ">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="h-full w-full border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-500/30 dark:hover:bg-blue-950 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium rounded-l-none"
                style={{ minHeight: "200px" }} // Altura mínima igual a las cards
              >
                {isLoadingMore ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{t("dashboard.events.loadingMore")}</span>
                  </>
                ) : (
                  <span className="text-lg">+ {t("common.more", "Más")}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
