import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heading1, Heading2, BodyText, Button, Card } from "@components/ui";
import { useMachineDetailsViewModel } from "../../viewModels/machines";
import { useMachineTypeName } from "@hooks";
import { useTranslation } from "react-i18next";

const statusVariants: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  MAINTENANCE: "bg-warning/10 text-warning",
  OUT_OF_SERVICE: "bg-destructive/10 text-destructive",
  RETIRED: "bg-muted text-muted-foreground",
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusVariants[status] ?? "bg-muted text-muted-foreground"}`}>
    {status}
  </span>
);

const InfoItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
      {label}
    </BodyText>
    <BodyText>{value ?? "—"}</BodyText>
  </div>
);

export const MachineDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { machine, isLoading, isError, errorMessage, refetch } = useMachineDetailsViewModel(id);
  
  // Resolve machine type name
  const machineTypeName = useMachineTypeName(machine?.machineTypeId);

  const specs = machine?.specs;
  const location = machine?.location;

  const infoItems = useMemo(() => ([
    { label: "Marca", value: machine?.brand },
    { label: "Modelo", value: machine?.modelName },
    { label: "Tipo", value: machineTypeName ?? (machine?.machineTypeId ? 'Cargando...' : undefined) },
    { label: "Nº Serie", value: machine?.serialNumber },
    { label: "Fuente de energía", value: specs?.fuelType ? t(`machines.fuelTypes.${specs.fuelType}`) : undefined },
    { label: "Nombre Referencia", value: machine?.nickname },
    { label: "Año", value: specs?.year },
    // {label: "Asignado a:", value: machine?.assignedTo },
    // { label: "Horas de operación", value: specs?.operatingHours ? `${specs.operatingHours} hrs` : undefined },
    // { label: "Ubicación actual", value: location?.siteName ?? location?.address },
  ]), [machine, specs, location, machineTypeName, t]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            {machine ? (machine.nickname || `${machine.brand} ${machine.modelName}`) : `Máquina #${id ?? "—"}`}
          </Heading1>
          <BodyText className="text-muted-foreground">
            Información completa y estado actual de la máquina
          </BodyText>
        </div>
        <div className="flex gap-3 grow justify-end">
          <Button variant="outline" size="default" disabled>
            Editar Máquina
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

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <BodyText className="text-destructive font-medium">No pudimos cargar la máquina.</BodyText>
          {errorMessage && <BodyText size="small" className="text-destructive/80">{errorMessage}</BodyText>}
          <Button variant="ghost" size="sm" className="mt-2" onPress={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Información General
            </Heading2>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item) => (
                  <InfoItem key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <Heading2 size="large" weight="bold">
              Estado Actual
            </Heading2>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ) : (
              <>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
                      Estado Operacional
                    </BodyText>
                    {machine && <StatusPill status={machine.status} />}
                  </div>
                  <InfoItem label="Asignado a" value={machine?.assignedTo}/>
                
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Horas de operación" value={specs?.operatingHours ? `${specs.operatingHours} hrs` : undefined} />
                  <InfoItem label={"Ubicación Actual"} value={machine?.location?.siteName} />
                </div>
                
                <InfoItem label="Actualizado" value={machine?.updatedAt ? new Date(machine.updatedAt).toLocaleString() : undefined} />
                {/* TODO: integrar quickchecks/mantenimientos cuando backend exponga endpoints */}
              </>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Actividad Reciente
          </Heading2>
          <BodyText size="small" className="text-muted-foreground">
            Próximamente mostraremos quickchecks y mantenimientos recientes de esta máquina.
          </BodyText>
        </div>
      </Card>
    </div>
  );
};
