import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const NotificationsScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Notificaciones y Alertas
          </Heading1>
          <BodyText className="text-muted-foreground">
            Mantente al día con todas las alertas y notificaciones del sistema
          </BodyText>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default">
            Marcar todas como leídas
          </Button>
          <Button variant="filled" size="default">
            Configurar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">Total</BodyText>
            <Heading2 size="headline" weight="bold" className="text-foreground">24</Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">Notificaciones</BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">Sin Leer</BodyText>
            <Heading2 size="headline" weight="bold" className="text-warning">7</Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">Nuevas</BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">Críticas</BodyText>
            <Heading2 size="headline" weight="bold" className="text-destructive">2</Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">Requieren atención</BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground">Esta semana</BodyText>
            <Heading2 size="headline" weight="bold" className="text-info">15</Heading2>
            <BodyText size="small" className="text-muted-foreground mt-1">Notificaciones</BodyText>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 border-b border-border">
              <Heading2 size="large" weight="bold">Todas las Notificaciones</Heading2>
            </div>
            
            <div className="divide-y divide-border">
              {/* Critical Notification */}
              <div className="p-4 bg-destructive/5 border-l-4 border-l-destructive">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <h4 className="font-medium text-foreground">Alerta Crítica: Falla en Sistema Hidráulico</h4>
                      <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">CRÍTICO</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bulldozer B-12 (#002) presenta falla crítica en el sistema hidráulico. 
                      Requiere atención inmediata.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Hace 15 minutos</span>
                      <span>Mantenimiento</span>
                      <span>Máquina #002</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground ml-4">
                    ✕
                  </button>
                </div>
              </div>

              {/* Warning Notification */}
              <div className="p-4 bg-warning/5 border-l-4 border-l-warning">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <h4 className="font-medium text-foreground">Mantenimiento Programado Próximo</h4>
                      <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">ATENCIÓN</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Excavadora Principal (#001) tiene mantenimiento preventivo programado 
                      para el 15 de diciembre.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Hace 2 horas</span>
                      <span>Programación</span>
                      <span>Máquina #001</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground ml-4">
                    ✕
                  </button>
                </div>
              </div>

              {/* Info Notification */}
              <div className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-info rounded-full"></div>
                      <h4 className="font-medium text-foreground">Chequeo Completado</h4>
                      <span className="text-xs text-info bg-info/10 px-2 py-1 rounded">INFO</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Juan Pérez completó el chequeo rápido de la Grúa Torre GT-5 (#003). 
                      Estado: Excelente.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Hace 4 horas</span>
                      <span>Chequeo</span>
                      <span>Máquina #003</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground ml-4">
                    ✕
                  </button>
                </div>
              </div>

              {/* Success Notification */}
              <div className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <h4 className="font-medium text-foreground">Mantenimiento Completado</h4>
                      <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">ÉXITO</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Se completó exitosamente el cambio de aceite en la Excavadora Principal (#001). 
                      Próximo mantenimiento en 250 horas.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Ayer</span>
                      <span>Mantenimiento</span>
                      <span>Máquina #001</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground ml-4">
                    ✕
                  </button>
                </div>
              </div>

              {/* System Notification */}
              <div className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <h4 className="font-medium text-foreground">Nueva Máquina Agregada</h4>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">SISTEMA</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Se agregó una nueva máquina al inventario: Excavadora Compacta EC-04 (#012). 
                      Configuración inicial requerida.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Hace 2 días</span>
                      <span>Inventario</span>
                      <span>Máquina #012</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground ml-4">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex justify-center">
                <Button variant="ghost" size="default">
                  Cargar más notificaciones
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Filtros</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Todas</option>
                  <option>Críticas</option>
                  <option>Advertencias</option>
                  <option>Información</option>
                  <option>Sistema</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Todas</option>
                  <option>Sin leer</option>
                  <option>Leídas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Máquina</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Todas las máquinas</option>
                  <option>Excavadora #001</option>
                  <option>Bulldozer #002</option>
                  <option>Grúa #003</option>
                </select>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90">
                Aplicar Filtros
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Configuración</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-foreground">Notificaciones por email</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-foreground">Alertas críticas inmediatas</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm text-foreground">Recordatorios de mantenimiento</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-foreground">Notificaciones de chequeos</span>
              </label>
            </div>

            <button className="w-full mt-4 border border-border py-2 px-4 rounded-lg hover:bg-muted">
              Guardar Configuración
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumen Semanal</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Notificaciones críticas</span>
                <span className="font-bold text-destructive">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Advertencias</span>
                <span className="font-bold text-warning">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Información</span>
                <span className="font-bold text-info">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completadas</span>
                <span className="font-bold text-success">18</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button className="w-full text-sm text-primary hover:text-primary/80">
                Ver reporte completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};