import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heading1,
  BodyText,
  Button,
  Card,
  CollapsibleSection,
  Heading2,
  Heading3,
} from "@components/ui";
import { useMachineDetailsViewModel } from "../../viewModels/machines";
import { useMachineTypeName } from "@hooks";
import { useTranslation } from "react-i18next";
import { Settings, Clock, Package } from "lucide-react";

const statusVariants: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  MAINTENANCE: "bg-warning/10 text-warning",
  OUT_OF_SERVICE: "bg-destructive/10 text-destructive",
  RETIRED: "bg-muted text-muted-foreground",
};

const StatusPill = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusVariants[status] ?? "bg-muted text-muted-foreground"}`}
  >
    {status}
  </span>
);

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div>
    <BodyText
      className="text-muted-foreground"
    >
      {label}
    </BodyText>
    <BodyText weight="medium">{value ?? "—"}</BodyText>
  </div>
);

export const MachineDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { machine, isLoading, isError, errorMessage, refetch } =
    useMachineDetailsViewModel(id);
  const [imageError, setImageError] = useState(false);

  // Resolve machine type name
  const machineTypeName = useMachineTypeName(machine?.machineTypeId);

  const specs = machine?.specs;
  const location = machine?.location;

  return (
    <div className="space-y-6">
      {/* Hero Section - Image + Main Metadata + Actions */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-3">
          {/* Machine Photo */}
          <div className="lg:col-span-1">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full bg-muted animate-pulse" />
              ) : machine?.machinePhotoUrl && !imageError ? (
                <img
                  src={machine.machinePhotoUrl}
                  alt={
                    machine.nickname || `${machine.brand} ${machine.modelName}`
                  }
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Settings className="w-16 h-16" />
                  <BodyText size="small" className="text-muted-foreground">
                    {t("machines.photo.notAvailable")}
                  </BodyText>
                </div>
              )}
            </div>
          </div>

          {/* Main Metadata */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <div className="flex flex-row flex-wrap justify-start items-end">
                  <Heading1 className="mr-2" >
                    {machine
                      ? machine.nickname ||
                        `${machine.brand} ${machine.modelName}`
                      : `Máquina #${id ?? "—"}`}
                  </Heading1>
                  <Heading2 weight="regular" size="headline">
                    {machine ? machine.serialNumber : "Sin número de serie"}
                  </Heading2>

                </div>
                <Heading3
                  size="large"
                  className="tracking-tight text-foreground"
                  weight="regular"
                >
                  {machine
                    ? `${machine.brand} ${machine.modelName}`
                    : "Información completa y estado actual de la máquina"}
                </Heading3>
                {machine ? (
                  <div className="mt-2">
                    <StatusPill status={machine.status} />
                  </div>
                ) : (
                  <div></div>
                )}
              </div>

              {machine && (
                <div className="space-y-3">
                  {/* Critical Information Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                    <InfoItem
                      label={t("machines.hero.brand")}
                      value={machine.brand}
                    />
                    <InfoItem
                      label={t("machines.hero.model")}
                      value={machine.modelName}
                    />
                    <InfoItem
                      label={t("machines.hero.serialNumber")}
                      value={machine.serialNumber}
                    />
                    <InfoItem
                      label={t("machines.hero.machineType")}
                      value={
                        machineTypeName ??
                        (machine.machineTypeId ? "Cargando..." : undefined)
                      }
                    />
                    <InfoItem
                      label={t("machines.hero.nickname")}
                      value={machine.nickname}
                    />
                    <InfoItem
                      label={t("machines.hero.operatingHours")}
                      value={
                        specs?.operatingHours
                          ? `${specs.operatingHours} hrs`
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 flex-wrap justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onPress={() => navigate(`/machines/${id}/edit`)}
                >
                  Editar Máquina
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onPress={() => navigate(`/machines/${id}/alarms`)}
                >
                  {t("machines.actions.viewMaintenanceAlarms")}
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onPress={() => navigate(`/machines/${id}/spare-parts`)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t("machines.actions.spareParts")}
                </Button>
              </div>
              <div className="flex-grow flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="default"
                  onPress={() => navigate(`/machines/${id}/events`)}
                  // icon={<History className="w-4 h-4" />}
                >
                  {t("machines.actions.viewEventHistory")}
                </Button>
                <Button
                  variant="filled"
                  size="default"
                  onPress={() => navigate(`/machines/${id}/quickcheck`)}
                >
                  Quickcheck
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/20 bg-destructive/5">
          <div className="p-6">
            <BodyText className="text-destructive font-medium">
              No pudimos cargar la máquina.
            </BodyText>
            {errorMessage && (
              <BodyText size="small" className="text-destructive/80 mt-1">
                {errorMessage}
              </BodyText>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onPress={() => refetch()}
            >
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {/* Main Grid - Collapsible Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Operation - Schedule, Assignment & Location */}
          <CollapsibleSection title={t("machines.sections.operation")}>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-4 bg-muted rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* Assignment */}
                    <BodyText
                      size="small"
                      weight="medium"
                      className="text-muted-foreground mb-1 flex items-center gap-1"
                    >
                      {t("machines.labels.assignedTo")}
                    </BodyText>
                    <BodyText weight="medium">{machine?.assignedTo}</BodyText>
                  </div>
                  <div>
                    {/* Location */}
                    <BodyText
                      size="small"
                      weight="medium"
                      className="text-muted-foreground mb-1"
                    >
                      {t("machines.labels.site")}
                    </BodyText>
                    <BodyText weight="medium">{location?.siteName}</BodyText>
                    {/* <InfoItem label={t('machines.labels.address')} value={location?.address} /> */}
                  </div>
                </div>

                {/* Operating Schedule */}
                {machine?.usageSchedule ? (
                  <>
                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <BodyText
                          size="small"
                          weight="medium"
                          className="text-muted-foreground mb-1 flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {t("machines.operation.dailyHours")}
                        </BodyText>
                        <BodyText weight="medium">
                          {machine.usageSchedule.dailyHours}h/día
                        </BodyText>
                      </div>
                      <div>
                        <BodyText
                          size="small"
                          weight="medium"
                          className="text-muted-foreground mb-1"
                        >
                          {t("machines.operation.weeklyHours")}
                        </BodyText>
                        <BodyText weight="medium">
                          {machine.usageSchedule.weeklyHours}h/sem
                        </BodyText>
                      </div>
                    </div>
                    {/* Operating Days */}
                    <div>
                      <BodyText
                        size="small"
                        weight="medium"
                        className="text-muted-foreground mb-2"
                      >
                        {t("machines.operation.operatingDays")}
                      </BodyText>

                      <div className="flex flex-wrap gap-2">
                        {machine.usageSchedule.operatingDays.map((day) => (
                          <span
                            key={day}
                            className="px-3 py-1 text-md font-medium bg-primary/10 text-primary rounded-full"
                          >
                            {t(`common.daysOfWeek.short.${day}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <BodyText size="small" className="text-muted-foreground">
                    {t("machines.operation.notConfigured")}
                  </BodyText>
                )}
              </div>
            )}
          </CollapsibleSection>
        </div>
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Technical Sheet - All machine information */}
          <CollapsibleSection title={t("machines.sections.technicalSheet")}>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label={t("machines.hero.brand")}
                  value={machine?.brand}
                />
                <InfoItem
                  label={t("machines.hero.model")}
                  value={machine?.modelName}
                />
                <InfoItem
                  label={t("machines.hero.serialNumber")}
                  value={machine?.serialNumber}
                />
                <InfoItem
                  label={t("machines.hero.machineType")}
                  value={
                    machineTypeName ??
                    (machine?.machineTypeId ? "Cargando..." : undefined)
                  }
                />
                <InfoItem
                  label={t("machines.hero.nickname")}
                  value={machine?.nickname}
                />
                <InfoItem
                  label={t("machines.hero.operatingHours")}
                  value={
                    specs?.operatingHours
                      ? `${specs.operatingHours} hrs`
                      : undefined
                  }
                />
                <InfoItem
                  label={t("machines.labels.year")}
                  value={specs?.year}
                />
                <InfoItem
                  label={t("machines.labels.fuelType")}
                  value={
                    specs?.fuelType
                      ? t(`machines.fuelTypes.${specs.fuelType}`)
                      : undefined
                  }
                />
                <InfoItem
                  label={t("machines.labels.weight")}
                  value={specs?.weight ? `${specs.weight} kg` : undefined}
                />
                <InfoItem
                  label={t("machines.labels.enginePower")}
                  value={
                    specs?.enginePower ? `${specs.enginePower} HP` : undefined
                  }
                />
                <InfoItem
                  label={t("machines.labels.maxCapacity")}
                  value={
                    specs?.maxCapacity ? `${specs.maxCapacity} kg` : undefined
                  }
                />
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};
