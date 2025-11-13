import React from 'react';
import { AppRouter } from './router/AppRouter';
import { Toaster } from '@components/ui';
import { GlobalModal } from '@components/GlobalModal';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppRouter />
      <GlobalModal />
      <Toaster />
    </div>
  );
};

export default App;