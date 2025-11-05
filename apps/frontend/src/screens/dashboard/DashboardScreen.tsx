import React from 'react';

export const DashboardScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Panel Principal
        </h1>
        <p className="text-muted-foreground">
          Resumen general de tu flota de máquinas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Máquinas</h3>
          <p className="text-3xl font-bold text-foreground">12</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Activas</h3>
          <p className="text-3xl font-bold text-success">10</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">En Mantenimiento</h3>
          <p className="text-3xl font-bold text-warning">2</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Alertas Críticas</h3>
          <p className="text-3xl font-bold text-destructive">0</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
          <div className="grid gap-4 grid-cols-2">
            <button className="p-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              Chequeo Rápido
            </button>
            <button className="p-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Reportar Evento
            </button>
            <button className="p-4 rounded-lg bg-success text-success-foreground hover:bg-success/90">
              Nueva Máquina
            </button>
            <button className="p-4 rounded-lg bg-info text-info-foreground hover:bg-info/90">
              Ver Alertas
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Chequeo completado - Máquina #001</span>
              <span className="text-xs text-muted-foreground">Hace 2h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Mantenimiento programado - Máquina #003</span>
              <span className="text-xs text-muted-foreground">Hace 4h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Nueva máquina agregada - Máquina #012</span>
              <span className="text-xs text-muted-foreground">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};