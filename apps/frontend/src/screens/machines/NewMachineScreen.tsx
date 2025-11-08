import React from 'react';
import { Heading1, BodyText, Button, Card } from '@components/ui';
import { useNavigate } from 'react-router-dom';

export const NewMachineScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Nueva Máquina
          </Heading1>
          <BodyText className="text-muted-foreground">
            Registra una nueva máquina en el sistema FleetMan
          </BodyText>
        </div>
        <Button 
          variant="outline" 
          size="default"
          onPress={() => navigate(-1)}
        >
          Cancelar
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la Máquina *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Excavadora Principal"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Máquina *
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Seleccionar tipo</option>
                  <option value="excavadora">Excavadora</option>
                  <option value="bulldozer">Bulldozer</option>
                  <option value="grua">Grúa</option>
                  <option value="retroexcavadora">Retroexcavadora</option>
                  <option value="cargadora">Cargadora</option>
                  <option value="otra">Otra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  placeholder="Ej: Caterpillar"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  placeholder="Ej: CAT 320D"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Año de Fabricación
                </label>
                <input
                  type="number"
                  placeholder="2023"
                  min="1990"
                  max="2024"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Número de Serie *
                </label>
                <input
                  type="text"
                  placeholder="Ej: CAT0320D-2023-001"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ubicación Inicial
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sector A - Zona Norte"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Horas de Operación Iniciales
                </label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción / Notas
              </label>
              <textarea
                rows={4}
                placeholder="Información adicional sobre la máquina..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                size="default"
                onPress={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button variant="filled" size="default">
                Guardar Máquina
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};