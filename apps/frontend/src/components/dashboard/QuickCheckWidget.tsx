import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useDragScroll } from "@hooks/useDragScroll";
import { QuickCheckListItem } from "./QuickCheckListItem";
import type { RecentQuickCheckDTO } from "@packages/contracts";
import { BodyText, Card, Heading2} from "@components/ui";

interface QuickCheckWidgetProps {
  quickChecks: RecentQuickCheckDTO[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore: boolean;
  error: Error | null;
  onLoadMore: () => void;
}

/**
 * QuickCheckWidget - Sprint #12 (Bundle 12)
 *
 * Widget contenedor para la sección de "Últimos QuickChecks Realizados".
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
export const QuickCheckWidget: React.FC<QuickCheckWidgetProps> = ({
  quickChecks,
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
  if (error && quickChecks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Heading2>{t("dashboard.quickchecks.title")}</Heading2>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-600 mb-4">
            {t("dashboard.quickchecks.error")}
          </p>
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
  if (quickChecks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Heading2>{t("dashboard.quickchecks.title")}</Heading2>
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">📋</div>
          <p className="text-gray-600 text-lg mb-2">
            {t("dashboard.quickchecks.empty.title")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("dashboard.quickchecks.empty.description")}
          </p>
        </div>
      </div>
    );
  }

  // Normal state con datos
  return (
    <Card
      className="bg-transparent overflow-visible shadow-none p-0 border-0"
      style={{ animation: `fadeSlideIn 0.3s ease-out ${0.3}s both` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Heading2>{t("dashboard.quickchecks.title")}</Heading2>
        <span className="text-sm text-gray-500">
          {t("dashboard.quickchecks.count", { count: quickChecks.length })}
        </span>
      </div>

      {/* Carousel horizontal scrollable con drag support */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide z-100"
          onWheel={(e) => {            
            e.currentTarget.scrollLeft += e.deltaY
          }}
        >
          {quickChecks.map((qc, index) => (
            <QuickCheckListItem
              key={`quickcheck-${qc.id}-${index}`}
              quickCheck={qc}
              style={{
                animation: `fadeSlideIn 0.3s ease-out ${(index % 5) * 0.2}s both`,
              }}
            />
          ))}

          {/* Botón "+ Más" como último item del carousel */}
          {hasMore && (
            <div className="flex-shrink-0 flex items-center justify-center w-[100px]">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="h-full w-full border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-500/30 dark:hover:bg-blue-950 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rounded-l-none"
                style={{ minHeight: "200px" }} // Altura mínima igual a las cards
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <BodyText size="medium">
                      {t("dashboard.quickchecks.loadingMore")}
                    </BodyText>
                  </>
                ) : (
                  <BodyText
                    size="medium"
                    weight="bold"
                    className="text-blue-600"
                  >
                    + {t("common.more", "Más")}
                  </BodyText>
                )}
              </button>
            </div>
          )}
        </div>
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
