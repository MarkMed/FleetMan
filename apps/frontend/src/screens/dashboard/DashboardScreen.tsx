import React from "react";
import { useAuth } from "../../store/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@constants/index";

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard FleetMan
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido
              {user?.profile.companyName ? `, ${user.profile.companyName}` : ""}{" "}
              - Gestión de tu flota de máquinas
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Card: Total Máquinas */}
          <div
            onClick={() => navigate("/machines")}
            className="bg-card rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-info/10">
                <svg
                  className="w-6 h-6 text-info"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Total Máquinas
                </h3>
                <p className="text-3xl font-bold text-info">12</p>
                <p className="text-sm text-muted-foreground">
                  Equipos registrados
                </p>
              </div>
            </div>
          </div>

          {/* Card: Activas */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-success/10">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">Activas</h3>
                <p className="text-3xl font-bold text-success">10</p>
                <p className="text-sm text-muted-foreground">
                  Operando normalmente
                </p>
              </div>
            </div>
          </div>

          {/* Card: Mantenimiento */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-warning/10">
                <svg
                  className="w-6 h-6 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Mantenimiento
                </h3>
                <p className="text-3xl font-bold text-warning">2</p>
                <p className="text-sm text-muted-foreground">
                  Requieren servicio
                </p>
              </div>
            </div>
          </div>

          {/* Card: Alertas Críticas */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-destructive/10">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Alertas Críticas
                </h3>
                <p className="text-3xl font-bold text-destructive">0</p>
                <p className="text-sm text-muted-foreground">
                  Requieren atención
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid gap-4 grid-cols-2">
                <button className="p-4 text-center rounded-lg border-2 border-dashed border-muted hover:border-info hover:bg-info/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-muted-foreground mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Chequeo Rápido
                  </p>
                </button>

                <button
                  onClick={() => navigate(ROUTES.NEW_MACHINE)}
                  className="p-4 text-center rounded-lg border-2 border-dashed border-info hover:border-primary hover:bg-primary/10 transition-all transform hover:scale-105 bg-info/5"
                >
                  <svg
                    className="w-6 h-6 text-primary mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-primary font-medium">
                    Nueva Máquina
                  </p>
                </button>

                <button className="p-4 text-center rounded-lg border-2 border-dashed border-muted hover:border-info hover:bg-info/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-muted-foreground mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Reportar Evento
                  </p>
                </button>

                <button className="p-4 text-center rounded-lg border-2 border-dashed border-muted hover:border-warning hover:bg-warning/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-warning mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM4 19h10v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1zM14 8a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-sm text-warning">Ver Alertas</p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Chequeo completado - Máquina #001
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Operador: Juan Pérez
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Hace 2h</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Mantenimiento programado - Máquina #003
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Técnico: María González
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Hace 4h</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Nueva máquina agregada - Máquina #012
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: Constructora ABC
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Ayer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Información de Usuario
          </h3>
          {user ? (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <h4 className="font-medium text-success">
                Usuario autenticado correctamente
              </h4>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-success">
                  Nombre de la empresa:
                </dt>
                <dd className="text-sm text-success-foreground">
                  {user.profile.companyName || "No especificado"}
                </dd>
                <dt className="text-sm font-medium text-success">Email:</dt>
                <dd className="text-sm text-success-foreground">
                  {user.email}
                </dd>
                <dt className="text-sm font-medium text-success">ID:</dt>
                <dd className="text-sm text-success-foreground">{user.id}</dd>
              </dl>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <p className="text-warning">
                No hay información de usuario disponible
              </p>
            </div>
          )}
        </div>

      </div>
      <div>Este layout es temporal, con propósito visual.</div>
    </div>
  );
};
