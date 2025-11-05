import React from 'react';

export const MaintenanceScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Mantenimiento
          </h1>
          <p className="text-muted-foreground">
            Planifica y registra el mantenimiento de tus máquinas
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          + Nuevo Mantenimiento
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Mantenimientos Pendientes</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Excavadora Principal (#001)</h4>
                  <p className="text-sm text-muted-foreground">Mantenimiento preventivo programado</p>
                  <p className="text-xs text-warning mt-1">Vence en 3 días</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
                    Completar
                  </button>
                  <button className="px-3 py-1 border border-border rounded text-sm hover:bg-muted">
                    Posponer
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Bulldozer B-12 (#002)</h4>
                  <p className="text-sm text-muted-foreground">Reparación de sistema hidráulico</p>
                  <p className="text-xs text-destructive mt-1">Vencido hace 2 días</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90">
                    Urgente
                  </button>
                  <button className="px-3 py-1 border border-border rounded text-sm hover:bg-muted">
                    Ver Detalles
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-info/5 border border-info/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Grúa Torre GT-5 (#003)</h4>
                  <p className="text-sm text-muted-foreground">Inspección de cables</p>
                  <p className="text-xs text-info mt-1">Programado para la próxima semana</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
                    Adelantar
                  </button>
                  <button className="px-3 py-1 border border-border rounded text-sm hover:bg-muted">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Historial Reciente</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Mantenimiento completado</p>
                  <p className="text-sm text-muted-foreground">Excavadora Principal (#001) - Cambio de aceite</p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 2 días</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Reparación urgente</p>
                  <p className="text-sm text-muted-foreground">Grúa Torre GT-5 (#003) - Falla eléctrica</p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 1 semana</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Inspección programada</p>
                  <p className="text-sm text-muted-foreground">Bulldozer B-12 (#002) - Revisión general</p>
                </div>
                <span className="text-xs text-muted-foreground">Hace 2 semanas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Estadísticas</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completados este mes</span>
                  <span className="font-medium text-foreground">8</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{width: '80%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className="font-medium text-foreground">3</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Vencidos</span>
                  <span className="font-medium text-foreground">1</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-destructive h-2 rounded-full" style={{width: '10%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recordatorios</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">Próximo mantenimiento</p>
                <p className="text-xs text-muted-foreground">Excavadora #001 - En 3 días</p>
              </div>

              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">Pedido de repuestos</p>
                <p className="text-xs text-muted-foreground">Filtros y aceites - Esta semana</p>
              </div>

              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">Entrenamiento programado</p>
                <p className="text-xs text-muted-foreground">Nuevos protocolos - Viernes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};