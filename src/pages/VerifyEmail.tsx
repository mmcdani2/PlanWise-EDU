import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FloatingParticles from '../components/FloatingParticles';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'unverified' | 'verified'>('checking');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const email = localStorage.getItem('signup_email') ?? '';
  
    const checkVerification = async () => {
        // Force refresh session so Supabase gets the latest email_verified state
        await supabase.auth.refreshSession();

        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            setStatus('unverified');
            setMessage('You are not logged in. Please log in again.');
            return;
        }

        if (data.user.email_confirmed_at) {
            setStatus('verified');
            navigate('/dashboard');
        } else {
            setStatus('unverified');
            setMessage('Still waiting for verification...');
        }
    };
      
  
    const handleResend = async () => {
      if (!email) {
        setMessage('No email available. Please sign up again.');
        return;
      }
  
      setIsResending(true);
      const { error } = await supabase.auth.resend({ type: 'signup', email });
  
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Verification email resent!');
      }
  
      setIsResending(false);
    };
  
    useEffect(() => {
      checkVerification();
      const interval = setInterval(checkVerification, 10000);
      return () => clearInterval(interval);
    }, []);
  

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 relative overflow-hidden">
            <FloatingParticles />
            <div className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-8 py-10 text-white relative z-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
                <p className="mb-4 text-white/80">
                    Please check your inbox and click the verification link to continue.
                </p>
                <p className="mb-2 text-sm text-white/60">
                    {email ? `Your signup email: ${email}` : 'Email unknown — please log in again if needed.'}
                </p>
                
                <div className="flex flex-col gap-4 justify-center items-center">
                    <button
                        onClick={checkVerification}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-medium"
                    >
                        I've Verified My Email
                    </button>
                    <button
                        onClick={handleResend}
                        className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded text-white border border-white/20 font-medium"
                        disabled={isResending}
                    >
                        {isResending ? 'Resending...' : 'Resend Email'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
