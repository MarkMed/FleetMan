import React from 'react';

export const QuickCheckScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Chequeo Rápido
        </h1>
        <p className="text-muted-foreground">
          Realiza inspecciones rápidas y registra el estado de las máquinas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Nuevo Chequeo</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Seleccionar Máquina
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option value="">Selecciona una máquina...</option>
                  <option value="001">Excavadora Principal (#001)</option>
                  <option value="002">Bulldozer B-12 (#002)</option>
                  <option value="003">Grúa Torre GT-5 (#003)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado General
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="p-3 border border-success bg-success/10 text-success rounded-lg hover:bg-success/20">
                    ✓ Excelente
                  </button>
                  <button type="button" className="p-3 border border-warning bg-warning/10 text-warning rounded-lg hover:bg-warning/20">
                    ⚠ Atención
                  </button>
                  <button type="button" className="p-3 border border-destructive bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20">
                    ✗ Crítico
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nivel de Combustible
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                    <option>Lleno (80-100%)</option>
                    <option>Medio (40-79%)</option>
                    <option>Bajo (20-39%)</option>
                    <option>Crítico (0-19%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Horas de Operación
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Checklist de Seguridad
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">Luces y señales funcionando</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">Frenos en buen estado</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">Niveles de fluidos correctos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">Estructuras sin daños visibles</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-foreground">Equipos de seguridad presentes</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Observaciones
                </label>
                <textarea 
                  rows={4}
                  placeholder="Describe cualquier problema o observación importante..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90"
                >
                  Completar Chequeo
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Chequeos Recientes</h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Excavadora #001</span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                    Excelente
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Por: Juan Pérez - Hace 2 horas</p>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Grúa #003</span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                    Atención
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Por: María García - Hace 1 día</p>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Bulldozer #002</span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive">
                    Crítico
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Por: Carlos López - Hace 2 días</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Estadísticas</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chequeos hoy</span>
                <span className="font-bold text-foreground">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Esta semana</span>
                <span className="font-bold text-foreground">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Promedio diario</span>
                <span className="font-bold text-foreground">2.1</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Estado General</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-success">Excelente</span>
                  <span>60%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-warning">Atención</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-destructive">Crítico</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
            
            <div className="space-y-2">
              <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted">
                <div className="font-medium text-foreground">Generar Reporte</div>
                <div className="text-xs text-muted-foreground">Exportar chequeos del día</div>
              </button>
              
              <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted">
                <div className="font-medium text-foreground">Programar Chequeos</div>
                <div className="text-xs text-muted-foreground">Configurar recordatorios</div>
              </button>
              
              <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted">
                <div className="font-medium text-foreground">Ver Historial</div>
                <div className="text-xs text-muted-foreground">Todos los chequeos</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};