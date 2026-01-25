import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Card,
  CardContent,
  BodyText,
  Badge,
  Skeleton,
  Button,
} from "@components/ui";
import { Search, Settings } from "lucide-react";
import { cn } from "@utils/cn";
import type { CreateMachineResponse as Machine } from "@contracts";

/**
 * MachineSelectModal - Modal de selección de máquina
 *
 * Presenta una lista de máquinas del usuario para que seleccione una
 * antes de navegar a la acción correspondiente (QuickCheck, Eventos, etc).
 *
 * Sprint #14 Task 2.1c: QuickActions System
 *
 * Features:
 * - Grid responsivo (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Cards con foto, nickname/modelo, serial number, status badge
 * - Búsqueda opcional (si hay > 5 máquinas)
 * - Empty state con CTA
 * - Loading state con skeletons
 * - Hover states en cards
 *
 * @example
 * ```tsx
 * <MachineSelectModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   machines={machines}
 *   onSelectMachine={(id) => navigate(`/machines/${id}/quickcheck`)}
 *   actionType="quickcheck"
 * />
 * ```
 */

interface MachineSelectModalProps {
  /**
   * Estado de apertura del modal
   */
  open: boolean;

  /**
   * Callback para cambiar el estado del modal
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Lista de máquinas disponibles
   */
  machines: Machine[];

  /**
   * Callback ejecutado cuando el usuario selecciona una máquina
   */
  onSelectMachine: (machineId: string) => void;

  /**
   * Tipo de acción para mostrar en el título/descripción
   */
  actionType?: string | null;

  /**
   * Estado de carga (opcional)
   */
  isLoading?: boolean;
}

export const MachineSelectModal: React.FC<MachineSelectModalProps> = ({
  open,
  onOpenChange,
  machines,
  onSelectMachine,
  actionType,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar máquinas por búsqueda
  const filteredMachines = useMemo(() => {
    if (!searchQuery.trim()) return machines;

    const query = searchQuery.toLowerCase();
    return machines.filter(
      (machine) =>
        machine.nickname?.toLowerCase().includes(query) ||
        machine.brand?.toLowerCase().includes(query) ||
        machine.modelName?.toLowerCase().includes(query) ||
        machine.serialNumber?.toLowerCase().includes(query),
    );
  }, [machines, searchQuery]);

  // Determinar si mostrar búsqueda (si hay más de 5 máquinas)
  const showSearch = machines.length > 5;

  /**
   * Validar si la URL de la imagen es válida
   */
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== "string") return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  /**
   * Handler para selección de máquina
   */
  const handleMachineClick = (machineId: string) => {
    onSelectMachine(machineId);
    onOpenChange(false);
    setSearchQuery(""); // Reset search on close
  };

  /**
   * Renderizar badge de status con color correspondiente
   */
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant:
          | "default"
          | "secondary"
          | "destructive"
          | "success"
          | "warning";
      }
    > = {
      ACTIVE: { label: t("machines.statuses.active"), variant: "success" },
      INACTIVE: {
        label: t("machines.statuses.inactive"),
        variant: "secondary",
      },
      MAINTENANCE: {
        label: t("machines.statuses.maintenance"),
        variant: "warning",
      },
      OUT_OF_SERVICE: {
        label: t("machines.statuses.broken"),
        variant: "destructive",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "default" as const,
    };
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("quickActions.selectMachine")}
      description={
        actionType
          ? t("quickActions.selectMachineDesc", { action: actionType })
          : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {/* Búsqueda (solo si hay > 5 máquinas) */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-32 w-full rounded" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State - Sin máquinas */}
        {!isLoading && machines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
            <BodyText weight="bold" className="mb-2">
              {t("quickActions.noMachines")}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground mb-4">
              {t("quickActions.noMachinesDesc")}
            </BodyText>
            <Button
              variant="filled"
              size="sm"
              onPress={() => {
                onOpenChange(false);
                // Strategic future: navigate to new machine
                // navigate(ROUTES.NEW_MACHINE);
              }}
            >
              {t("quickActions.registerFirstMachine")}
            </Button>
          </div>
        )}

        {/* Empty State - Sin resultados de búsqueda */}
        {!isLoading && machines.length > 0 && filteredMachines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <BodyText weight="bold" className="mb-2">
              {t("common.noResults")}
            </BodyText>
            <BodyText size="small" className="text-muted-foreground">
              {t("common.tryDifferentSearch")}
            </BodyText>
          </div>
        )}

        {/* Lista de máquinas */}
        {!isLoading && filteredMachines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {filteredMachines.map((machine) => (
              <Card
                key={machine.id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group"
                onClick={() => handleMachineClick(machine.id)}
              >
                {/* Background Image Blurred */}
                {isValidImageUrl(machine.machinePhotoUrl) && (
                  <div
                    className="absolute inset-0 bg-contain blur-md bg-center opacity-80 group-hover:opacity-30 transition-opacity duration-200 bg-no-repeat"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 1)",
                      backgroundImage: `url(${machine.machinePhotoUrl})`,
                    }}
                  />
                )}

                <CardContent className="relative p-0 flex flex-row h-32">
                  {/* Imagen Izquierda - Cuadrada */}
                  <div className="w-32 h-full flex-shrink-0 bg-muted/50 overflow-hidden">
                    {isValidImageUrl(machine.machinePhotoUrl) ? (
                      <img
                        src={machine.machinePhotoUrl!}
                        alt={machine.nickname || machine.modelName}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Settings className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Información Derecha con Gradient */}
                  <div className="flex-1 flex flex-col justify-between items-end bg-gradient-to-l from-black/80 via-black/60 to-black/0 p-3">
                    <div>
                      <BodyText
                        weight="bold"
                        size="medium"
                        className="line-clamp-2 text-white/80 leading-tight text-right"
                      >
                        {machine.nickname ||
                          `${machine.brand} ${machine.modelName}`}
                      </BodyText>
                    </div>

                    <div className="w-full flex flex-col items-end gap-1">
                      <BodyText
                        weight="medium"
                        className="text-white/80 line-clamp-1"
                      >
                        {machine.brand} {machine.modelName}
                      </BodyText>
                      <BodyText className="text-white/60 line-clamp-1">
                        SN: {machine.serialNumber}
                      </BodyText>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Strategic future: Filtros adicionales
      <div className="mt-4 pt-4 border-t border-border">
        <BodyText size="small" className="text-muted-foreground mb-2">
          {t('common.filter')}
        </BodyText>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="outline" size="sm">Active</Button>
          <Button variant="outline" size="sm">Maintenance</Button>
        </div>
      </div>
      */}
    </Modal>
  );
};
