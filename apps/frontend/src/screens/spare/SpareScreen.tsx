import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const SpareScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Gestión de Repuestos
          </Heading1>
          <BodyText className="text-muted-foreground">
            Administra el inventario de repuestos y consumibles
          </BodyText>
        </div>
        <Button variant="filled" size="default">
          + Nuevo Repuesto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Total Repuestos
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-foreground">
              247
            </Heading2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Stock Bajo
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-warning">
              12
            </Heading2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Sin Stock
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-destructive">
              3
            </Heading2>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <BodyText size="small" weight="medium" className="text-muted-foreground mb-1">
              Valor Total
            </BodyText>
            <Heading2 size="large" weight="bold" className="text-foreground">
              $45,230
            </Heading2>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar repuestos..." 
          className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
          <option>Todas las categorías</option>
          <option>Filtros</option>
          <option>Aceites</option>
          <option>Neumáticos</option>
          <option>Piezas Motor</option>
          <option>Hidráulicos</option>
        </select>
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
          <option>Todos los estados</option>
          <option>En Stock</option>
          <option>Stock Bajo</option>
          <option>Sin Stock</option>
        </select>
      </div>

      {/* Parts Table */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-3">
            <div>Código</div>
            <div>Nombre</div>
            <div>Categoría</div>
            <div>Stock Actual</div>
            <div>Stock Mínimo</div>
            <div>Precio Unit.</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>
          
          <div className="divide-y divide-border">
            {/* Spare Part Row Example */}
            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">FLT-001</div>
              <div className="text-foreground">Filtro de Aceite CAT</div>
              <div className="text-foreground">Filtros</div>
              <div className="text-foreground">25</div>
              <div className="text-foreground">10</div>
              <div className="text-foreground">$45.00</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-success/10 text-success">
                  En Stock
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Usar</button>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">HYD-012</div>
              <div className="text-foreground">Manguera Hidráulica 1/2"</div>
              <div className="text-foreground">Hidráulicos</div>
              <div className="text-foreground">3</div>
              <div className="text-foreground">8</div>
              <div className="text-foreground">$120.00</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-warning/10 text-warning">
                  Stock Bajo
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Solicitar</button>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-4 py-4 text-sm">
              <div className="font-medium text-foreground">NEU-005</div>
              <div className="text-foreground">Neumático 20.5R25</div>
              <div className="text-foreground">Neumáticos</div>
              <div className="text-foreground">0</div>
              <div className="text-foreground">2</div>
              <div className="text-foreground">$850.00</div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-destructive/10 text-destructive">
                  Sin Stock
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-primary hover:text-primary/80 text-xs">Ver</button>
                <button className="text-primary hover:text-primary/80 text-xs">Editar</button>
                <button className="text-primary hover:text-primary/80 text-xs">Solicitar</button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Mostrando 3 de 247 repuestos</span>
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