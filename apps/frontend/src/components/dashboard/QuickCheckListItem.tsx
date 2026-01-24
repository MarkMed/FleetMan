import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { RecentQuickCheckDTO } from "@packages/contracts";
import { BodyText, Card, Button } from "@components/ui";

interface QuickCheckListItemProps {
  quickCheck: RecentQuickCheckDTO;
}

const separatorClasses = "border-b border-border pb-2 border-b-gray-500/20";

/**
 * QuickCheckListItem - Sprint #12 (Bundle 12)
 *
 * Card para mostrar un QuickCheck reciente en el carousel del dashboard.
 * Reutiliza el diseño del QuickCheckHistoryScreen para consistencia visual.
 *
 * Features:
 * - Diseño consistente con historial de QuickChecks
 * - Badge de resultado con colores semánticos
 * - Stats con íconos (aprobados/desaprobados/omitidos)
 * - Info de máquina y responsable
 * - Observaciones truncadas
 * - Navegación al detalle de la máquina
 *
 * UI: Card con ancho fijo (280px), altura auto, hover effects
 */
export const QuickCheckListItem: React.FC<QuickCheckListItemProps> = ({
  quickCheck,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/machines/${quickCheck.machine.id}/quickcheck/history`);
  };

  // Format date (formato corto para dashboard)
  const formattedDate = format(new Date(quickCheck.date), "d MMM yyyy, HH:mm", {
    locale: es,
  });

  // Determinar badge classes basado en resultado
  const getResultBadgeClasses = (result: string) => {
    switch (result) {
      case "approved":
        return "bg-green-200 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "disapproved":
        return "bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "notInitiated":
        return "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Determinar texto del resultado
  const getResultDisplayText = (result: string) => {
    switch (result) {
      case "approved":
        return t("quickchecks.result.approved");
      case "disapproved":
        return t("quickchecks.result.disapproved");
      case "notInitiated":
        return t("quickchecks.result.notInitiated");
      default:
        return t("quickchecks.result.notInitiated");
    }
  };
  console.log("machine data:", quickCheck.machine);
  return (
    <Card
      className="flex flex-col flex-shrink-0 p-5 hover:shadow-lg transition-shadow cursor-pointer min-w-[280px] max-w-[280px]"
    >
      
      {/* Stats Summary - Mismo diseño del historial */}
      <div
        className={`flex flex-row flex-wrap justify-between gap-2`}
      >
        {/* Result Badge */}
        <div>
          <BodyText
            size="medium"
            className={`px-2.5 rounded-full flex-shrink-0 flex flex-row justify-center items-center -ml-1 ${getResultBadgeClasses(quickCheck.result)}`}
          >
            {getResultDisplayText(quickCheck.result)}
          </BodyText>

        </div>

        {/* Icons + Stats */}
        <div className={`flex flex-row flex-wrap justify-evenly gap-2`}>
          <div className="flex flex-row items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <BodyText
              size="medium"
              className="text-green-600 dark:text-green-400 pt-0.5"
            >
              <span className="font-bold">{quickCheck.approvedItemsCount}</span>
              {/* {" "}{t("quickchecks.stats.approved")} */}
            </BodyText>
          </div>
          <div className="flex flex-row items-center justify-center gap-1 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <BodyText
              size="medium"
              className="text-red-600 dark:text-red-400 pt-0.5"
            >
              <span className="font-bold">
                {quickCheck.disapprovedItemsCount}
              </span>
              {/* {" "}{t("quickchecks.stats.disapproved")} */}
            </BodyText>
          </div>
          {/* Omitidos calculados */}
          <div className="flex flex-row items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <BodyText
              size="medium"
              className="text-yellow-600 dark:text-yellow-400"
            >
              <span className="font-bold">
                {quickCheck.quickCheckItemsCount -
                  quickCheck.approvedItemsCount -
                  quickCheck.disapprovedItemsCount}
              </span>
              {/* {" "}{t("quickchecks.stats.omitted")} */}
            </BodyText>
          </div>
        </div>
      </div>
      {/* Name & date */}
      <div
        className={`flex flex-col items-start justify-between ${separatorClasses} mt-2`}
      >
        <div className="w-full flex flex-row flex-wrap justify-between items-center mt-1">
          {/* Machine Info */}
          <BodyText size="medium" weight="medium" className="truncate">
            {quickCheck.machine.serialNumber}
          </BodyText>
          
          <BodyText
            size="regular"
            weight="medium"
            className="font-medium text-foreground centered"
          >
            {formattedDate}
          </BodyText>

          <BodyText size="medium" className="truncate flex justify-start" >
            {quickCheck.machine.name}
          </BodyText>
          {/* <p className="text-xs text-muted-foreground truncate">
            {quickCheck.machine.machineType?.name || 'Sin tipo'}
          </p> */}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between mt-3">
        <div>
          {/* Responsible Info */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-6 h-6 text-muted-foreground flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <BodyText
              className="text-muted-foreground"
              size="regular"
              weight="medium"
            >
              {quickCheck.responsibleName}
            </BodyText>
            <BodyText
              className="text-muted-foreground"
              size="regular"
              weight="regular"
            >
              {quickCheck.responsibleWorkerId
                ? `(${quickCheck.responsibleWorkerId})`
                : ""}
            </BodyText>
          </div>

          {/* Observations (truncated) - Dialog style */}
          {quickCheck.observations && (
            <div className="mb-3 flex flex-col justify-start">
              <div className="h-3 w-3 rotate-45 translate-y-[50%] translate-x-[20%] bg-gray-200 dark:bg-slate-700 border border-slate-500 z-0"></div>
              <div className="bg-gray-200 dark:bg-slate-700 border border-border rounded-lg p-3 rounded-tl-none border border-slate-500 z-10 border-t-0">
                <BodyText
                  size="regular"
                  className="text-muted-foreground line-clamp-2 leading-relaxed"
                >
                  {quickCheck.observations}
                </BodyText>
              </div>
            </div>
          )}
        </div>
        <div>
          {/* Arrow indicator (click to view machine) */}
          <Button
            onPress={handleClick}
            variant="outline"
            className="flex items-center justify-center w-full"
            aria-label={t("dashboard.quickchecks.viewMachine")}
          >
            <span>{t("dashboard.quickchecks.viewMachine")}</span>
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
