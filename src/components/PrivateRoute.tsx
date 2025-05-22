// src/components/PrivateRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        setIsProfileComplete(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      setIsProfileComplete(!error && !!data);
      setLoading(false);
    };

    checkProfile();
  }, []);

  if (loading) return <div className="text-white text-center p-4">Checking your profile...</div>;

  if (!isProfileComplete) return <Navigate to="/onboarding" state={{ from: location }} replace />;

  return <Outlet />;
};

export default PrivateRoute;
