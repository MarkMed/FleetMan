import React from 'react';
import { AppRouter } from './router/AppRouter';
import { Toaster } from '@components/ui';
import { GlobalModal } from '@components/GlobalModal';
import { useSessionExpiredHandler } from './hooks/useSessionExpiredHandler';

const App: React.FC = () => {
  // Global handler for session expiration (401 responses)
  useSessionExpiredHandler();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppRouter />
      <GlobalModal />
      <Toaster />
    </div>
  );
};

export default App;