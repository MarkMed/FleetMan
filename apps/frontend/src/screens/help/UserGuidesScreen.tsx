import React from 'react';
import { Heading1, Heading2, BodyText, Button, Card } from '@components/ui';

export const UserGuidesScreen: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading1 size="headline" className="tracking-tight text-foreground">
            Guías de Usuario
          </Heading1>
          <BodyText className="text-muted-foreground">
            Documentación y tutoriales para usar FleetMan efectivamente
          </BodyText>
        </div>
        <Button variant="outline" size="default">
          Descargar PDF Completo
        </Button>
      </div>

      {/* Quick Start */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Inicio Rápido
          </Heading2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <BodyText weight="medium" className="mb-2">
                📊 Dashboard Principal
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Comprende los indicadores clave y navegación básica
              </BodyText>
            </div>
            
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <BodyText weight="medium" className="mb-2">
                🚜 Gestión de Máquinas
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Cómo registrar y administrar tu flota de máquinas
              </BodyText>
            </div>
            
            <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <BodyText weight="medium" className="mb-2">
                ✅ Realizar Quickchecks
              </BodyText>
              <BodyText size="small" className="text-muted-foreground">
                Proceso paso a paso para inspecciones diarias
              </BodyText>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Gestión de Operaciones
            </Heading2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📋</span>
                <div className="flex-1">
                  <BodyText weight="medium">Registro de Máquinas</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Cómo agregar nuevas máquinas al sistema
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">🔧</span>
                <div className="flex-1">
                  <BodyText weight="medium">Programación de Mantenimiento</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Configurar cronogramas de mantenimiento preventivo
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📍</span>
                <div className="flex-1">
                  <BodyText weight="medium">Ubicaciones y Zonas</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Gestionar ubicaciones de trabajo y zonas
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📦</span>
                <div className="flex-1">
                  <BodyText weight="medium">Inventario de Repuestos</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Administrar stock y proveedores
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <Heading2 size="large" weight="bold" className="mb-4">
              Monitoreo y Reportes
            </Heading2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📊</span>
                <div className="flex-1">
                  <BodyText weight="medium">Dashboard y KPIs</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Interpretar métricas y indicadores clave
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📈</span>
                <div className="flex-1">
                  <BodyText weight="medium">Reportes Personalizados</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Crear y exportar reportes específicos
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">🔔</span>
                <div className="flex-1">
                  <BodyText weight="medium">Sistema de Alertas</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Configurar notificaciones automáticas
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <span className="text-lg">📱</span>
                <div className="flex-1">
                  <BodyText weight="medium">App Móvil</BodyText>
                  <BodyText size="small" className="text-muted-foreground">
                    Usar FleetMan desde dispositivos móviles
                  </BodyText>
                </div>
                <span className="text-primary text-sm">→</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            Preguntas Frecuentes
          </Heading2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <BodyText weight="medium">¿Cómo puedo resetear mi contraseña?</BodyText>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <BodyText size="small" className="text-muted-foreground">
                  Puedes resetear tu contraseña desde la pantalla de login haciendo clic en "¿Olvidaste tu contraseña?" 
                  o contactando al administrador del sistema.
                </BodyText>
              </div>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <BodyText weight="medium">¿Con qué frecuencia debo hacer quickchecks?</BodyText>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <BodyText size="small" className="text-muted-foreground">
                  Se recomienda realizar quickchecks al inicio de cada turno de trabajo, antes de operar cualquier máquina.
                </BodyText>
              </div>
            </details>
            
            <details className="group">
              <summary className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <BodyText weight="medium">¿Puedo usar FleetMan offline?</BodyText>
                <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <BodyText size="small" className="text-muted-foreground">
                  Algunas funciones como quickchecks pueden realizarse offline en la app móvil. 
                  Los datos se sincronizarán cuando recuperes la conexión.
                </BodyText>
              </div>
            </details>
          </div>
        </div>
      </Card>

      {/* Contact Support */}
      <Card>
        <div className="p-6">
          <Heading2 size="large" weight="bold" className="mb-4">
            ¿Necesitas Más Ayuda?
          </Heading2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="filled" size="default" className="flex-1">
              📧 Contactar Soporte
            </Button>
            <Button variant="outline" size="default" className="flex-1">
              💬 Chat en Vivo
            </Button>
            <Button variant="outline" size="default" className="flex-1">
              📞 Llamar Soporte
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};