import React from 'react';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚛 FleetMan
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('dashboard.title')} - Sistema de Gestión de Flota
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                📊 {t('navigation.dashboard')}
              </h3>
              <p className="text-blue-700 text-sm">
                Panel principal con métricas y resumen
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                🚚 {t('navigation.machines')}
              </h3>
              <p className="text-green-700 text-sm">
                Gestión y monitoreo de máquinas
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">
                🔧 {t('navigation.maintenance')}
              </h3>
              <p className="text-orange-700 text-sm">
                Programación y seguimiento de mantenimientos
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                ✅ {t('navigation.quickcheck')}
              </h3>
              <p className="text-purple-700 text-sm">
                Chequeos rápidos y evaluaciones
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={toggleLanguage}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              🌐 {i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            </button>
            
            <div className="text-sm text-gray-500">
              {t('common.loading')} Frontend v1.0.0
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🛠️ Estado del Desarrollo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Configuración ✅
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Dependencias ✅
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              i18n ✅
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Componentes 🚧
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Layouts 🚧
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              Pantallas 🚧
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;