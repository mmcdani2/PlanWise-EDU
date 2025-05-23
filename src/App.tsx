// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import VerifyEmail from './pages/VerifyEmail';
import LoadingScreen from './components/LoadingScreen';
import type { Session } from '@supabase/supabase-js';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<null | any>(null);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(profileData);
      }

      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchSessionAndProfile(); // re-run logic on login/logout
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route path="/verify-email" element={<VerifyEmail />} />


      <Route
        path="/onboarding"
        element={
          session && session.user.email_confirmed_at && profile === null
            ? <Onboarding />
            : <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="/dashboard"
        element={
          session && session.user.email_confirmed_at && profile
            ? <Dashboard />
            : <Navigate to="/auth" replace />
        }
      />

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
