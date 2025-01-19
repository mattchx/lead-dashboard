import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard'>('login');

  return (
    <AuthProvider>
      {currentPage === 'login' ? (
        <Login onLoginSuccess={() => setCurrentPage('dashboard')} />
      ) : (
        <Dashboard onLogout={() => setCurrentPage('login')} />
      )}
    </AuthProvider>
  );
}
