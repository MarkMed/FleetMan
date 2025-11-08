import React from 'react';
import { Heading1, BodyText, Button } from '@components/ui';

export const MachinesScreen: React.FC = () => {
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
        <Button variant="filled" size="default">
          + Nueva Máquina
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar máquinas..." 
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
        />
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
          <option>Todos los tipos</option>
          <option>Excavadora</option>
          <option>Bulldozer</option>
          <option>Grúa</option>
        </select>
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
          <option>Todos los estados</option>
          <option>Activa</option>
          <option>En Mantenimiento</option>
          <option>Fuera de Servicio</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="p-6">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-3">
            <div>ID</div>
            <div>Nombre</div>
            <div>Tipo</div>
            <div>Estado</div>
            <div>Ubicación</div>
            <div>Último Chequeo</div>
            <div>Acciones</div>
          </div>
          
          <div className="divide-y divide-border">
            {/* Machine Row Example */}
            <div className="grid grid-cols-7 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#001</div>
              <div className="text-foreground">Excavadora Principal</div>
              <div className="text-foreground">Excavadora</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                  Activa
                </span>
              </div>
              <div className="text-foreground">Sector A</div>
              <div className="text-muted-foreground">Hace 2 días</div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Chequeo</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#002</div>
              <div className="text-foreground">Bulldozer B-12</div>
              <div className="text-foreground">Bulldozer</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                  Mantenimiento
                </span>
              </div>
              <div className="text-foreground">Taller</div>
              <div className="text-muted-foreground">Hace 1 semana</div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-muted-foreground text-xs" disabled>Chequeo</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">#003</div>
              <div className="text-foreground">Grúa Torre GT-5</div>
              <div className="text-foreground">Grúa</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                  Activa
                </span>
              </div>
              <div className="text-foreground">Sector C</div>
              <div className="text-muted-foreground">Hace 1 día</div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Chequeo</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando 3 de 12 máquinas</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-muted">Anterior</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-muted">2</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-muted">Siguiente</button>
        </div>
      </div>
    </div>
  );
};