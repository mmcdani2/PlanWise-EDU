
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/planwise-logo.png';
import googleSignInButton from '../assets/btn_google_signin_neutral_normal_web.svg';
import FloatingParticles from '../components/FloatingParticles';
import TermsModal from '../components/TermsModal';
import { useSessionContext } from '../context/SessionProvider';
import LoadingScreen from '../components/LoadingScreen';

export default function Auth() {
    const navigate = useNavigate();
    const { session, profile, loading } = useSessionContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

    if (loading) return <LoadingScreen />;

    const checkStrength = (pwd: string) => {
        const strong = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}/;
        const medium = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/;
        if (strong.test(pwd)) return 'strong';
        if (medium.test(pwd)) return 'medium';
        return 'weak';
    };

    const handlePasswordChange = (val: string) => {
        setPassword(val);
        setPasswordStrength(checkStrength(val));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!email || !password) return setMessage('Email and password are required.');
        if (!isLogin) {
            if (!agreed) return setMessage('You must agree to the terms and privacy policy.');
            if (password !== confirmPassword) return setMessage('Passwords do not match.');
        }

        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error || !data.user) return setMessage('Invalid email or password.');

            const userId = data.user.id;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('onboarding_complete')
                .eq('id', userId)
                .single();

            if (!profile) {
                await supabase.auth.signOut();
                return setMessage('Your account exists but no profile was found. Please complete onboarding.');
            }

            profile.onboarding_complete ? navigate('/dashboard') : navigate('/onboarding');
        } else {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError || !signUpData.user) {
                return setMessage(signUpError?.message || 'Signup failed.');
            }

            // No profile creation here — we do that at the end of onboarding
            navigate('/onboarding');
        }
    };


    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) setMessage(error.message);
    };

    const handleResetPassword = async () => {
        if (!email) return setMessage('Enter your email to reset password.');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://your-app-url.com/update-password',
        });

        if (error) setMessage(error.message);
        else setMessage('Password reset email sent.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4">
            <FloatingParticles />
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-8 py-10 text-white relative z-10"
            >
                <motion.img
                    src={logo}
                    alt="PlanWise Logo"
                    style={{ height: '8rem' }}
                    className="mx-auto mb-6 transition duration-300 hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: isLogin ? -40 : 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 40 : -40 }}
                        transition={{ duration: 0.4 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-sm text-blue-300"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>

                            {!isLogin && (
                                <>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />

                                    {password.length > 0 && (
                                        <div className="text-sm">
                                            Password Strength:{' '}
                                            <span
                                                className={
                                                    passwordStrength === 'strong'
                                                        ? 'text-green-400'
                                                        : passwordStrength === 'medium'
                                                            ? 'text-yellow-400'
                                                            : 'text-red-400'
                                                }
                                            >
                                                {passwordStrength}
                                            </span>
                                        </div>
                                    )}

                                    <label className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                        />
                                        <span>
                                            I agree to the{' '}
                                            <button
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className="text-blue-400 underline"
                                            >
                                                Terms & Privacy
                                            </button>
                                        </span>
                                    </label>
                                </>
                            )}

                            {message && (
                                <p className="text-red-400 text-sm text-center mt-2">{message}</p>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                            >
                                {isLogin ? 'Log In' : 'Sign Up'}
                            </motion.button>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full mt-3"
                            >
                                <img src={googleSignInButton} alt="Sign in with Google" className="mx-auto h-10" />
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? (
                        <>
                            Don’t have an account?{' '}
                            <button onClick={() => setIsLogin(false)} className="text-blue-400 hover:underline">
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setIsLogin(true)} className="text-blue-400 hover:underline">
                                Log In
                            </button>
                        </>
                    )}
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="text-gray-500 hover:text-white hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </motion.div>

            <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                onAgree={() => setAgreed(true)}
            />
        </div>
    );
}
