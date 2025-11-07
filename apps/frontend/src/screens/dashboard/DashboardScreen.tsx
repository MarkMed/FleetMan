import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  TextBlock, 
  Heading1, 
  BodyText, 
  SmallText,
  Card,
  CardContent,
  StatCard,
  toast,
  modal
} from '@components/ui';
import { 
  Activity, 
  Truck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  FileText,
  Bell
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { t } = useTranslation();

  /**
   * Quick actions handlers
   * These demonstrate the new Button component with onPress callbacks
   * Now also demonstrate toast notifications
   */
  const handleQuickCheck = () => {
    console.log('Quick check initiated');
    
    // Show global modal instead of local state
    modal.show({
      title: "Chequeo Rápido",
      description: "Selecciona una máquina para iniciar el chequeo de seguridad",
      content: (
        <div className="space-y-4">
          <BodyText>
            Esta es una demostración del Modal Global. Aquí podrías mostrar:
          </BodyText>
          <ul className="space-y-2 ml-4">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              <SmallText>Lista de máquinas disponibles</SmallText>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              <SmallText>Formulario de chequeo rápido</SmallText>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              <SmallText>Resultados del chequeo</SmallText>
            </li>
          </ul>
        </div>
      ),
      variant: 'info',
      confirmText: "Iniciar Chequeo",
      cancelText: "Cancelar",
      onConfirm: () => {
        toast.success({
          title: "Chequeo Iniciado",
          description: "El proceso de chequeo rápido ha comenzado correctamente.",
        });
      }
    });
  };

  const handleReportEvent = () => {
    console.log('Report event clicked');
    toast.info({
      title: "Formulario de Reporte",
      description: "Abriendo formulario para reportar un evento...",
    });
  };

  const handleNewMachine = () => {
    console.log('New machine creation started');
    toast.success({
      title: "Nueva Máquina",
      description: "Iniciando proceso de registro de nueva máquina.",
    });
  };

  const handleViewAlerts = () => {
    console.log('View alerts clicked');
    const alertCount = 2;
    if (alertCount > 0) {
      toast.warning({
        title: "Alertas Pendientes",
        description: `Tienes ${alertCount} alertas que requieren atención.`,
      });
    } else {
      toast.success({
        title: "Sin Alertas",
        description: "No hay alertas pendientes en este momento.",
      });
    }
  };

  const handleTestToasts = () => {
    // Demonstrate different toast variants
    toast.success({
      title: "Operación Exitosa",
      description: "La acción se completó correctamente.",
    });

    setTimeout(() => {
      toast.warning({
        title: "Atención Requerida",
        description: "Hay elementos que necesitan tu revisión.",
      });
    }, 1000);

    setTimeout(() => {
      toast.error({
        title: "Error Detectado",
        description: "Se encontró un problema que requiere intervención.",
      });
    }, 2000);

    setTimeout(() => {
      toast.info({
        title: "Información",
        description: "Proceso completado. Revisa los resultados.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Page Header - Using new TextBlock components */}
      <div>
        <Heading1 color="textPrimary">
          {t('dashboard.title')}
        </Heading1>
        <BodyText color="textSecondary" style="mt-2">
          {t('dashboard.overview')} - Resumen general de tu flota de máquinas
        </BodyText>
      </div>

      {/* Statistics Grid - Using new StatCard components */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.totalMachines')}
          value="12"
          icon={<Truck className="h-4 w-4" />}
          description="Total de equipos registrados"
        />
        
        <StatCard
          title={t('dashboard.activeMachines')}
          value="10"
          valueColor="success"
          icon={<CheckCircle className="h-4 w-4" />}
          description="Operando normalmente"
        />
        
        <StatCard
          title={t('dashboard.maintenanceDue')}
          value="2"
          valueColor="warning"
          icon={<Wrench className="h-4 w-4" />}
          description="Requieren mantenimiento"
        />
        
        <StatCard
          title={t('dashboard.criticalAlerts')}
          value="0"
          valueColor="error"
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Alertas que requieren atención"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions Card - Using new components */}
        <Card>
          <CardContent className="p-6">
            <TextBlock as="h3" size="large" weight="medium" style="mb-4">
              {t('dashboard.quickActions')}
            </TextBlock>
            <div className="grid gap-4 grid-cols-2">
              <Button
                variant="filled"
                onPress={handleQuickCheck}
                className="p-4 h-auto flex-col gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                <SmallText color="textWhite">
                  {t('dashboard.actions.quickCheck')}
                </SmallText>
              </Button>
              
              <Button
                variant="secondary"
                onPress={handleReportEvent}
                className="p-4 h-auto flex-col gap-2"
              >
                <FileText className="h-5 w-5" />
                <SmallText>
                  {t('dashboard.actions.reportEvent')}
                </SmallText>
              </Button>
              
              <Button
                variant="success"
                onPress={handleNewMachine}
                className="p-4 h-auto flex-col gap-2"
              >
                <Plus className="h-5 w-5" />
                <SmallText color="textWhite">
                  {t('dashboard.actions.newMachine')}
                </SmallText>
              </Button>
              
              <Button
                variant="outline"
                onPress={handleViewAlerts}
                className="p-4 h-auto flex-col gap-2"
              >
                <Bell className="h-5 w-5" />
                <SmallText>
                  Ver Alertas
                </SmallText>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardContent className="p-6">
            <TextBlock as="h3" size="large" weight="medium" style="mb-4">
              {t('dashboard.recentActivity')}
            </TextBlock>
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <div>
                    <BodyText size="small">
                      Chequeo completado - Máquina #001
                    </BodyText>
                    <SmallText color="textMuted">
                      Operador: Juan Pérez
                    </SmallText>
                  </div>
                </div>
                <SmallText color="textMuted">
                  Hace 2h
                </SmallText>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <div>
                    <BodyText size="small">
                      Mantenimiento programado - Máquina #003
                    </BodyText>
                    <SmallText color="textMuted">
                      Técnico: María González
                    </SmallText>
                  </div>
                </div>
                <SmallText color="textMuted">
                  Hace 4h
                </SmallText>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-info"></div>
                  <div>
                    <BodyText size="small">
                      Nueva máquina agregada - Máquina #012
                    </BodyText>
                    <SmallText color="textMuted">
                      Cliente: Constructora ABC
                    </SmallText>
                  </div>
                </div>
                <SmallText color="textMuted">
                  Ayer
                </SmallText>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications Demo Section */}
      <Card>
        <CardContent className="p-6">
          <TextBlock as="h3" size="large" weight="medium" style="mb-4">
            Demostraciones de Componentes
          </TextBlock>
          <BodyText style="mb-4" color="textSecondary">
            Prueba los diferentes tipos de notificaciones toast y observa las animaciones mejoradas de los componentes.
          </BodyText>
          <div className="flex flex-wrap gap-3">
            <Button variant="filled" onPress={handleTestToasts}>
              Probar Todas las Notificaciones
            </Button>
            <Button 
              variant="success" 
              onPress={() => toast.success({
                title: "¡Éxito!",
                description: "Operación completada correctamente."
              })}
            >
              Toast de Éxito
            </Button>
            <Button 
              variant="warning" 
              onPress={() => toast.warning({
                title: "Advertencia",
                description: "Esta acción requiere confirmación."
              })}
            >
              Toast de Advertencia
            </Button>
            <Button 
              variant="destructive" 
              onPress={() => toast.error({
                title: "Error",
                description: "Algo salió mal. Intenta nuevamente."
              })}
            >
              Toast de Error
            </Button>
            <Button 
              variant="secondary" 
              onPress={() => toast.info({
                title: "Información",
                description: "Aquí tienes información importante."
              })}
            >
              Toast de Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Modal Demonstrations Section */}
      <Card>
        <CardContent className="p-6">
          <TextBlock as="h3" size="large" weight="medium" style="mb-4">
            Sistema de Modal Global
          </TextBlock>
          <BodyText style="mb-4" color="textSecondary">
            Demuestra el sistema de modal global que puede ser controlado desde cualquier componente de la aplicación.
          </BodyText>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              variant="filled" 
              onPress={() => modal.info({
                title: "Información",
                description: "Este es un modal informativo que se muestra usando el sistema global.",
                dismissText: "Entendido"
              })}
            >
              Modal Info
            </Button>
            
            <Button 
              variant="warning" 
              onPress={() => modal.warning({
                title: "Advertencia",
                description: "Esta es una advertencia importante que debes leer cuidadosamente.",
                dismissText: "He sido advertido"
              })}
            >
              Modal Advertencia
            </Button>
            
            <Button 
              variant="destructive" 
              onPress={() => modal.error({
                title: "Error Crítico",
                description: "Se ha detectado un error que requiere tu atención inmediata.",
                dismissText: "Cerrar"
              })}
            >
              Modal Error
            </Button>
            
            <Button 
              variant="success" 
              onPress={() => modal.success({
                title: "¡Operación Exitosa!",
                description: "La acción se completó correctamente sin errores.",
                dismissText: "Continuar"
              })}
            >
              Modal Éxito
            </Button>
            
            <Button 
              variant="outline" 
              onPress={async () => {
                const confirmed = await modal.confirm({
                  title: "Confirmar Acción",
                  description: "¿Estás seguro de que quieres continuar con esta acción?",
                  confirmText: "Sí, continuar",
                  cancelText: "No, cancelar"
                });
                
                if (confirmed) {
                  toast.success({ 
                    title: "Confirmado", 
                    description: "Has confirmado la acción." 
                  });
                } else {
                  toast.info({ 
                    title: "Cancelado", 
                    description: "Has cancelado la acción." 
                  });
                }
              }}
            >
              Modal Confirmación
            </Button>
            
            <Button 
              variant="secondary" 
              onPress={async () => {
                const confirmed = await modal.confirm({
                  title: "Eliminar Elemento",
                  description: "¿Estás seguro? Esta acción no se puede deshacer.",
                  action: "danger",
                  confirmText: "Sí, eliminar",
                  cancelText: "Cancelar"
                });
                
                if (confirmed) {
                  // Simulate async operation
                  modal.setLoading(true);
                  setTimeout(() => {
                    modal.hide();
                    toast.success({ 
                      title: "Eliminado", 
                      description: "El elemento ha sido eliminado exitosamente." 
                    });
                  }, 2000);
                } else {
                  toast.info({ 
                    title: "Cancelado", 
                    description: "No se eliminó el elemento." 
                  });
                }
              }}
            >
              Modal Peligroso
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};