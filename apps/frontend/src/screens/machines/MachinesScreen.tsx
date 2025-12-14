import React from "react";
import { useNavigate } from "react-router-dom";
import { Heading1, BodyText, Button, Card, CardContent, CardHeader, CardTitle } from "@components/ui";
import { useMachinesViewModel } from "../../viewModels/machines";
import { useMachineTypeResolver } from "@hooks";

const statusVariants: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  MAINTENANCE: "bg-warning/10 text-warning",
  OUT_OF_SERVICE: "bg-destructive/10 text-destructive",
  RETIRED: "bg-muted text-muted-foreground",
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusVariants[status] ?? "bg-muted text-muted-foreground"}`}>
    {status}
  </span>
);

export const MachinesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { machines, isLoading, isError, errorMessage, refetch } = useMachinesViewModel();
  
  // Resolve machine type IDs to names efficiently (batch lookup)
  const machineTypeIds = machines.map(m => m.machineTypeId);
  const machineTypeNames = useMachineTypeResolver(machineTypeIds);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Gestión de Máquinas
          </Heading1>
          <BodyText className="text-muted-foreground">
            Administra tu inventario de máquinas y su información
          </BodyText>
        </div>
        <Button
          variant="filled"
          size="default"
          onPress={() => navigate("/machines/new")}
        >
          + Nueva Máquina
        </Button>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">No pudimos cargar las máquinas.</p>
          {errorMessage && <p className="text-xs text-destructive/80">{errorMessage}</p>}
          <Button variant="ghost" size="sm" className="mt-2" onPress={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Cards for mobile */}
      <div className="space-y-4 md:hidden">
        {isLoading && (
          <Card>
            <CardContent className="py-6 space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        )}
        {!isLoading && machines.length === 0 && (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">No hay máquinas registradas todavía.</p>
            </CardContent>
          </Card>
        )}
        {machines.map((machine, index) => (
          <Card 
            key={machine.id} 
            className="border border-border"
            style={{
              animation: `fadeSlideIn 0.4s ease-out ${index * 0.16}s both`,
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{machine.brand} {machine.modelName}</span>
                <StatusPill status={machine.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nº Serie</span>
                <span className="font-mono text-foreground">{machine.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="text-foreground">{machineTypeNames.get(machine.machineTypeId) ?? 'Cargando...'}</span>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm" onPress={() => navigate(`/machines/${machine.id}`)}>
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table for desktop */}
      <div className="hidden md:block rounded-lg border border-border bg-card">
        <div className="p-6">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-3">
            <div>Marca</div>
            <div>Modelo</div>
            <div>Nº Serie</div>
            <div>Tipo</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </div>
          <div className="divide-y divide-border">
            {isLoading && (
              <div className="grid grid-cols-6 gap-4 py-4 text-sm">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
              </div>
            )}
            {!isLoading && machines.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground text-center">
                No hay máquinas registradas todavía.
              </div>
            )}
            {!isLoading && machines.map((machine, index) => (
              <div 
                key={machine.id} 
                className="grid grid-cols-6 gap-4 py-4 text-sm items-center"
                style={{
                  animation: `fadeSlideIn 0.4s ease-out ${index * 0.16}s both`,
                }}
              >
                <div className="text-foreground">{machine.brand}</div>
                <div className="text-foreground">{machine.modelName}</div>
                <div className="text-foreground font-mono">{machine.serialNumber}</div>
                <div className="text-foreground">{machineTypeNames.get(machine.machineTypeId) ?? 'Cargando...'}</div>
                <div>
                  <StatusPill status={machine.status} />
                </div>
                <div className="text-right">
                  <Button variant="ghost" size="sm" onPress={() => navigate(`/machines/${machine.id}`)}>
                    Ver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
