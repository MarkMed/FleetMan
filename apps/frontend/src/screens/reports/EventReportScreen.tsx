import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const EventReportScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Reportes de Eventos
          </Heading1>
          <BodyText className="text-muted-foreground">
            Gestiona y reporta incidentes, accidentes y eventos operacionales
          </BodyText>
        </div>
        <Button variant="filled" size="default">
          + Nuevo Reporte
        </Button>
      </div>

      {/* Event Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Eventos Este Mes
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-foreground">
              23
            </Heading2>
            <BodyText size="small" className="text-muted-foreground">
              +3 vs mes anterior
            </BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Incidentes Graves
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-destructive">
              2
            </Heading2>
            <BodyText size="small" className="text-muted-foreground">
              Requieren seguimiento
            </BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              En Investigación
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-warning">
              5
            </Heading2>
            <BodyText size="small" className="text-muted-foreground">
              Pendientes de cierre
            </BodyText>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Resueltos
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-success">
              16
            </Heading2>
            <BodyText size="small" className="text-muted-foreground">
              Cerrados este mes
            </BodyText>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar reportes..." 
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
          <option>Todos los tipos</option>
          <option>Accidente</option>
          <option>Incidente</option>
          <option>Falla Mecánica</option>
          <option>Operacional</option>
          <option>Ambiental</option>
        </select>
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
          <option>Todos los estados</option>
          <option>Nuevo</option>
          <option>En Investigación</option>
          <option>Resuelto</option>
          <option>Cerrado</option>
        </select>
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
          <option>Última semana</option>
          <option>Último mes</option>
          <option>Últimos 3 meses</option>
          <option>Este año</option>
        </select>
      </div>

      {/* Events Table */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-3">
            <div>ID</div>
            <div>Tipo</div>
            <div>Fecha/Hora</div>
            <div>Máquina</div>
            <div>Operador</div>
            <div>Severidad</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
          
          <div className="divide-y divide-border">
            {/* Event Row Example - Critical */}
            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#ERV-001</div>
              <div className="text-foreground">Accidente</div>
              <div className="text-foreground">
                <div>15/11/2024</div>
                <div className="text-xs text-muted-foreground">14:30</div>
              </div>
              <div className="text-foreground">Excavadora #003</div>
              <div className="text-foreground">Pedro Silva</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive">
                  Crítica
                </span>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                  Investigando
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Seguimiento</button>
              </div>
            </div>

            {/* Event Row Example - Medium */}
            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#ERV-002</div>
              <div className="text-foreground">Falla Mecánica</div>
              <div className="text-foreground">
                <div>14/11/2024</div>
                <div className="text-xs text-muted-foreground">09:15</div>
              </div>
              <div className="text-foreground">Bulldozer #002</div>
              <div className="text-foreground">María López</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                  Media
                </span>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                  Resuelto
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Reporte</button>
                <button className="text-primary hover:text-primary/80 text-xs">Cerrar</button>
              </div>
            </div>

            {/* Event Row Example - Low */}
            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#ERV-003</div>
              <div className="text-foreground">Operacional</div>
              <div className="text-foreground">
                <div>13/11/2024</div>
                <div className="text-xs text-muted-foreground">16:45</div>
              </div>
              <div className="text-foreground">Grúa #005</div>
              <div className="text-foreground">Carlos Ruiz</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-info/10 text-info">
                  Baja
                </span>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-muted-foreground">
                  Cerrado
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-muted-foreground text-xs" disabled>Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Archivar</button>
              </div>
            </div>

            {/* Event Row Example - New */}
            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#ERV-004</div>
              <div className="text-foreground">Incidente</div>
              <div className="text-foreground">
                <div>16/11/2024</div>
                <div className="text-xs text-muted-foreground">11:20</div>
              </div>
              <div className="text-foreground">Cargadora #007</div>
              <div className="text-foreground">Ana García</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                  Media
                </span>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-info/10 text-info">
                  Nuevo
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Asignar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Investigar</button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity Timeline */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Actividad Reciente
          </Heading2>
          <div className="space-y-4">
            <div className="border-l-4 border-destructive pl-4">
              <BodyText weight="medium" className="text-destructive">Nuevo Accidente Reportado</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 2 horas - Excavadora #003 - Pedro Silva
              </BodyText>
              <BodyText size="small">Accidente menor durante operación de carga, sin lesiones reportadas</BodyText>
            </div>
            
            <div className="border-l-4 border-success pl-4">
              <BodyText weight="medium" className="text-success">Incidente Resuelto</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Ayer, 16:30 - Bulldozer #002 - Investigador: Ana González
              </BodyText>
              <BodyText size="small">Falla del sistema hidráulico resuelto con cambio de componente</BodyText>
            </div>
            
            <div className="border-l-4 border-warning pl-4">
              <BodyText weight="medium" className="text-warning">Investigación Iniciada</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 2 días - Grúa #001 - Asignado a: Carlos Mendoza
              </BodyText>
              <BodyText size="small">Inicio de investigación por sobrecarga del sistema</BodyText>
            </div>
            
            <div className="border-l-4 border-info pl-4">
              <BodyText weight="medium" className="text-info">Reporte Enviado</BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Hace 3 días - Cargadora #005 - Enviado a: Supervisión
              </BodyText>
              <BodyText size="small">Reporte mensual de eventos enviado al equipo de supervisión</BodyText>
            </div>
          </div>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando 4 de 23 eventos</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Anterior</Button>
          <Button variant="filled" size="sm">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Siguiente</Button>
        </div>
      </div>
    </div>
  );
};