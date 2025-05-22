import { Routes, Route, Navigate } from 'react-router-dom';
import { useSessionContext } from './context/SessionProvider';
import LoadingScreen from './components/LoadingScreen';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';

function App() {
  const { session, profile, loading } = useSessionContext();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          session && profile ? <Dashboard /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/onboarding"
        element={
          session && !profile ? <Onboarding /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;