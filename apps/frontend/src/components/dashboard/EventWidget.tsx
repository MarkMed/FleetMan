import { useTranslation } from 'react-i18next';
import { EventListItem } from './EventListItem';
import type { RecentMachineEventDTO } from '@packages/contracts';
import { Card, Heading2 } from '@components/ui';

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
        <Heading2>
          {t('dashboard.events.title')}
        </Heading2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-600 mb-4">{t('dashboard.events.error')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <Card>
        <Heading2>
          {t('dashboard.events.title')}
        </Heading2>
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg mb-2">
            {t('dashboard.events.empty.title')}
          </p>
          <p className="text-gray-500 text-sm">
            {t('dashboard.events.empty.description')}
          </p>
        </div>
      </Card>
    );
  }

  // Normal state con datos
  return (
    <Card className="bg-transparent overflow-visible shadow-none p-0 border-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Heading2>
          {t('dashboard.events.title')}
        </Heading2>
        <span className="text-sm text-gray-500">
          {t('dashboard.events.count', { count: events.length })}
        </span>
      </div>

      {/* Carousel horizontal scrollable */}
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {events.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}

          {/* Skeleton durante "Load More" */}
          {isLoadingMore && (
            <div className="flex-shrink-0 w-[280px] h-[200px] bg-gray-100 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Botón "Ver más" */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoadingMore ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>{t('dashboard.events.loadingMore')}</span>
                </>
              ) : (
                <span>{t('dashboard.events.loadMore')}</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS para hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Card>
  );
};
