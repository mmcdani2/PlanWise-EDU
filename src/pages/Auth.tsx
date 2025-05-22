import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import logo from '../assets/planwise-logo.png';
import FloatingParticles from '../components/FloatingParticles';


export default function Auth() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) navigate('/onboarding');
        };
        checkUser();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const { error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) setMessage(error.message);
        else isLogin ? navigate('/onboarding') : setMessage('Check your email to confirm sign-up.');
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
                {/* 🔆 Logo with hover glow */}
                <motion.img
                    src={logo}
                    alt="PlanWise Logo"
                    style={{ height: '8rem' }} // halfway between h-20 and h-24
                    className="mx-auto mb-6 transition duration-300 hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                />

                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </motion.button>
                </form>

                {message && (
                    <p className="text-red-400 text-sm text-center mt-4">{message}</p>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                    {isLogin ? (
                        <>
                            Don’t have an account?{' '}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-blue-400 hover:underline"
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => setIsLogin(true)}
                                className="text-blue-400 hover:underline"
                            >
                                Log In
                            </button>
                        </>
                    )}
                    <div className="mt-2">
                        <button className="text-gray-500 hover:text-white hover:underline">
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
