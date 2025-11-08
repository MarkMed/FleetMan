import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const QuickCheckScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <Heading1 size="headline" className="tracking-tight text-foreground">
          Chequeo Rápido (Quickcheck)
        </Heading1>
        <BodyText className="text-muted-foreground">
          Realiza inspecciones rápidas y registra el estado de las máquinas
        </BodyText>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">Nuevo Chequeo</Heading2>
            
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Seleccionar Máquina
                  </label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
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
                    <button type="button" className="p-3 border border-success bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                      ✓ Excelente
                    </button>
                    <button type="button" className="p-3 border border-warning bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors">
                      ⚠ Atención
                    </button>
                    <button type="button" className="p-3 border border-destructive bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                      ✗ Crítico
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nivel de Combustible
                    </label>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
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
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Checklist de Seguridad
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 accent-primary" />
                      <BodyText size="small">Luces y señales funcionando</BodyText>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 accent-primary" />
                      <BodyText size="small">Frenos en buen estado</BodyText>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 accent-primary" />
                      <BodyText size="small">Niveles de fluidos correctos</BodyText>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 accent-primary" />
                      <BodyText size="small">Estructuras sin daños visibles</BodyText>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 accent-primary" />
                      <BodyText size="small">Equipos de seguridad presentes</BodyText>
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="filled" size="default" className="flex-1">
                    Completar Chequeo
                  </Button>
                  <Button variant="outline" size="default">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">Chequeos Recientes</Heading2>
            
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <BodyText weight="medium">Excavadora #001</BodyText>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                      Excelente
                    </span>
                  </div>
                  <BodyText size="small" className="text-muted-foreground">Por: Juan Pérez - Hace 2 horas</BodyText>
                </div>

                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <BodyText weight="medium">Grúa #003</BodyText>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                      Atención
                    </span>
                  </div>
                  <BodyText size="small" className="text-muted-foreground">Por: María García - Hace 1 día</BodyText>
                </div>

                <div className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <BodyText weight="medium">Bulldozer #002</BodyText>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive">
                      Crítico
                    </span>
                  </div>
                  <BodyText size="small" className="text-muted-foreground">Por: Carlos López - Hace 2 días</BodyText>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">Estadísticas</Heading2>
            
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <BodyText size="small" className="text-muted-foreground">Chequeos hoy</BodyText>
                  <BodyText weight="bold">3</BodyText>
                </div>
                <div className="flex justify-between items-center">
                  <BodyText size="small" className="text-muted-foreground">Esta semana</BodyText>
                  <BodyText weight="bold">15</BodyText>
                </div>
                <div className="flex justify-between items-center">
                  <BodyText size="small" className="text-muted-foreground">Promedio diario</BodyText>
                  <BodyText weight="bold">2.1</BodyText>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <BodyText size="small" weight="medium" className="mb-2">Estado General</BodyText>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <BodyText size="small" className="text-success">Excelente</BodyText>
                    <BodyText size="small">60%</BodyText>
                  </div>
                  <div className="flex justify-between text-xs">
                    <BodyText size="small" className="text-warning">Atención</BodyText>
                    <BodyText size="small">30%</BodyText>
                  </div>
                  <div className="flex justify-between text-xs">
                    <BodyText size="small" className="text-destructive">Crítico</BodyText>
                    <BodyText size="small">10%</BodyText>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <Heading2 size="large" weight="bold" className="mb-4">Acciones Rápidas</Heading2>
            
              <div className="space-y-2">
                <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                  <BodyText weight="medium">Generar Reporte</BodyText>
                  <BodyText size="small" className="text-muted-foreground">Exportar chequeos del día</BodyText>
                </button>
              
                <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                  <BodyText weight="medium">Programar Chequeos</BodyText>
                  <BodyText size="small" className="text-muted-foreground">Configurar recordatorios</BodyText>
                </button>
              
                <button className="w-full p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                  <BodyText weight="medium">Ver Historial</BodyText>
                  <BodyText size="small" className="text-muted-foreground">Todos los chequeos</BodyText>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};