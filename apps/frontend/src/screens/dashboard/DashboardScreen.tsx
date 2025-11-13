import React from 'react';
import { useAuth } from '../../store/AuthProvider';

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard FleetMan
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido{user?.profile.companyName ? `, ${user.profile.companyName}` : ''} - Gestión de tu flota de máquinas
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Máquinas</h3>
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-500">Equipos registrados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Activas</h3>
                <p className="text-3xl font-bold text-green-600">10</p>
                <p className="text-sm text-gray-500">Operando normalmente</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Mantenimiento</h3>
                <p className="text-3xl font-bold text-yellow-600">2</p>
                <p className="text-sm text-gray-500">Requieren servicio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-md bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Alertas Críticas</h3>
                <p className="text-3xl font-bold text-red-600">0</p>
                <p className="text-sm text-gray-500">Requieren atención</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="grid gap-4 grid-cols-2">
                <button className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-gray-600">Chequeo Rápido</p>
                </button>
                
                <button className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm text-gray-600">Nueva Máquina</p>
                </button>
                
                <button className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">Reportar Evento</p>
                </button>
                
                <button className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h10v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1zM14 8a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">Ver Alertas</p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Chequeo completado - Máquina #001
                      </p>
                      <p className="text-sm text-gray-500">
                        Operador: Juan Pérez
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Hace 2h</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Mantenimiento programado - Máquina #003
                      </p>
                      <p className="text-sm text-gray-500">
                        Técnico: María González
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Hace 4h</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Nueva máquina agregada - Máquina #012
                      </p>
                      <p className="text-sm text-gray-500">
                        Cliente: Constructora ABC
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Ayer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información de Usuario
          </h3>
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Usuario autenticado correctamente</h4>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-green-600">Nombre de la empresa:</dt>
                <dd className="text-sm text-green-800">{user.profile.companyName || 'No especificado'}</dd>
                <dt className="text-sm font-medium text-green-600">Email:</dt>
                <dd className="text-sm text-green-800">{user.email}</dd>
                <dt className="text-sm font-medium text-green-600">ID:</dt>
                <dd className="text-sm text-green-800">{user.id}</dd>
              </dl>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">No hay información de usuario disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};