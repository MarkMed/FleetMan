import { DashboardScreen } from '@screens/dashboard/DashboardScreen';
import { Toaster } from '@components/ui';
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
      <DashboardScreen />
      <Toaster />
    </div>
  );
};

export default App;