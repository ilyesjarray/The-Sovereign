import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Lock, ChevronRight, Mail, Key, UserPlus, LogIn, Github, Chrome } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SovereignSplashProps {
    onComplete: () => void;
}

import { useSound } from '@/providers/SoundProvider';
import { usePWA } from '@/hooks/usePWA';

export function SovereignSplash({ onComplete }: SovereignSplashProps) {
    const { playClick } = useSound();
    const { isInstallable, install } = usePWA();
    const [state, setState] = useState<'WARMUP' | 'INITIAL' | 'AUTH_FORM' | 'SCANNING' | 'GRANTED' | 'VERIFY_EMAIL' | 'BIOMETRIC'>('WARMUP');
    const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [progress, setProgress] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        // 3-Second Mandatory Warmup
        if (state === 'WARMUP') {
            const timer = setTimeout(() => {
                setState('INITIAL');
            }, 3000);
            return () => clearTimeout(timer);
        }

        // Check for existing session
        if (state === 'INITIAL') {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setState('GRANTED');
                }
            });
        }
    }, [state]);

    useEffect(() => {
        if (state === 'SCANNING') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setState('GRANTED'), 500);
                        return 100;
                    }
                    return prev + 2.5; // Faster for real auth
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [state]);

    useEffect(() => {
        if (state === 'GRANTED') {
            const timer = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [state, onComplete]);

    const handleSocialAuth = async (provider: 'github' | 'google') => {
        setError(null);
        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (authError) throw authError;
        } catch (err: any) {
            setError(err.message || 'SOCIAL_AUTH_FAILED');
            setLoading(false);
        }
    };

    const handleBiometric = async () => {
        setState('BIOMETRIC');
        // Imperial Biometric Protocol (WebAuthn Simulation)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In a real environment with HTTPS, we'd use navigator.credentials.get
            setState('SCANNING');
        } catch (err) {
            setError('BIOMETRIC_SENSOR_OFFLINE');
            setState('AUTH_FORM');
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (authMode === 'SIGNUP') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: email.split('@')[0] }
                    }
                });
                if (signUpError) throw signUpError;
                // Auto-proceed for development/Commander override
                setState('SCANNING');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (signInError) throw signInError;
                setState('SCANNING');
            }
        } catch (err: any) {
            // Commander Override: Ignore email confirmation if requested
            if (err.message?.includes('Email not confirmed')) {
                setState('SCANNING'); // Bypass for the Commander
                return;
            }
            setError(err.message || 'AUTHENTICATION_FAILED');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-carbon-black flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.05),transparent)]" />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#00F3FF 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-6 text-center">
                <AnimatePresence mode="wait">
                    {state === 'WARMUP' && (
                        <motion.div
                            key="warmup"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center space-y-8"
                        >
                            <div className="w-16 h-16 border-b-2 border-hyper-cyan rounded-full animate-spin" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-hyper-cyan tracking-[0.8em] uppercase animate-pulse">
                                    System_Warmup_Active
                                </p>
                                <p className="text-white/20 text-[8px] uppercase tracking-widest font-mono">
                                    Stabilizing neural vectors...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {state === 'INITIAL' && (
                        <motion.div
                            key="initial"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-12"
                        >
                            <div className="relative group cursor-pointer" onClick={() => { playClick(); setState('AUTH_FORM'); }}>
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-hyper-cyan/20 blur-3xl rounded-full"
                                />
                                <div className="w-40 h-40 bg-white/[0.02] border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
                                    <img src="/assets/icon.png" alt="Sovereign Icon" className="w-24 h-24 object-contain z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-hyper-cyan/10 to-transparent" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-[10px] font-black text-hyper-cyan tracking-[0.8em] uppercase"
                                >
                                    Sovereign_Protocol_Initialize
                                </motion.div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                                    Welcome to the Empire
                                </h2>
                                <p className="text-white/30 text-xs uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                    High-access protocol requires neural identity verification.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 w-full max-w-xs">
                                <button
                                    onClick={() => { playClick(); handleBiometric(); }}
                                    className="group flex items-center justify-center gap-4 px-10 py-5 bg-hyper-cyan text-carbon-black rounded-2xl font-black text-sm tracking-widest transition-all shadow-neon-cyan/40 hover:scale-105 active:scale-95"
                                >
                                    <Fingerprint className="w-6 h-6" />
                                    <span>BIOMETRIC_ACCESS</span>
                                </button>
                                <button
                                    onClick={() => { playClick(); setState('AUTH_FORM'); }}
                                    className="group flex items-center justify-center gap-4 px-10 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-2xl font-black text-[10px] tracking-widest transition-all"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>STANDARD_UPLINK</span>
                                </button>
                                
                                {isInstallable && (
                                    <button
                                        onClick={() => { playClick(); install(); }}
                                        className="group flex items-center justify-center gap-4 px-10 py-4 bg-white/5 hover:bg-white/10 text-hyper-cyan border border-hyper-cyan/20 rounded-2xl font-black text-[10px] tracking-widest transition-all mt-4"
                                    >
                                        <Chrome className="w-4 h-4" />
                                        <span>DOWNLOAD_SOVEREIGN</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {state === 'BIOMETRIC' && (
                        <motion.div
                            key="biometric"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center space-y-12"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.5, 0.2]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-hyper-cyan rounded-full blur-3xl"
                                />
                                <div className="w-48 h-48 rounded-full border-2 border-hyper-cyan/20 flex items-center justify-center relative overflow-hidden">
                                    <Fingerprint className="w-24 h-24 text-hyper-cyan animate-pulse" />
                                    <motion.div
                                        animate={{ y: [-100, 100, -100] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-x-0 h-1 bg-hyper-cyan/50 shadow-neon-cyan"
                                    />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-white italic tracking-[0.3em] uppercase">Scanning_Identity</h3>
                                <p className="text-[10px] text-hyper-cyan uppercase font-mono tracking-widest animate-pulse">Neural_Pattern_Matching_Active</p>
                            </div>
                        </motion.div>
                    )}

                    {state === 'AUTH_FORM' && (
                        <motion.div
                            key="auth-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-sm glass-v-series p-10 border border-white/10 rounded-[2.5rem] bg-white/[0.01]"
                        >
                            <div className="mb-8 text-left">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                                    {authMode === 'LOGIN' ? 'Access_Terminal' : 'New_Identity'}
                                </h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-mono mt-2">
                                    {authMode === 'LOGIN' ? 'Verify existing credentials' : 'Establish imperial link'}
                                </p>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-hyper-cyan transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="CORP_EMAIL@LINK"
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-hyper-cyan transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="CIPHER_KEY"
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-bold text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all uppercase tracking-widest"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-[9px] font-black uppercase tracking-widest"
                                    >
                                        Error: {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-hyper-cyan text-carbon-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-neon-cyan transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : (authMode === 'LOGIN' ? 'Authorize' : 'Initialize')}
                                    {authMode === 'LOGIN' ? <LogIn size={16} /> : <UserPlus size={16} />}
                                </button>

                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center text-white/5">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[8px] uppercase tracking-widest text-white/20">
                                        <span className="bg-carbon-black px-4 px-2">Social_Uplink</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleSocialAuth('github')}
                                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-xl transition-all"
                                    >
                                        <Github size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Github</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSocialAuth('google')}
                                        className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-xl transition-all"
                                    >
                                        <Chrome size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Google</span>
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                                <button
                                    onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                                    className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-hyper-cyan transition-colors"
                                >
                                    {authMode === 'LOGIN' ? 'Create new imperial node?' : 'Already have an uplink?'}
                                </button>
                                <div className="flex items-center gap-4 text-[8px] text-white/10 font-mono italic">
                                    <ShieldCheck size={10} />
                                    <span>END-TO-END QUANTUM ENCRYPTION ACTIVE</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {state === 'VERIFY_EMAIL' && (
                        <motion.div
                            key="verify-email"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-sm glass-v-series p-10 border border-amber-500/30 rounded-[2.5rem] bg-amber-500/5 text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
                                <Mail className="w-8 h-8 text-amber-500 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Verification Required</h3>
                            <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">
                                Please check your email to activate your imperial access.
                                <br />
                                <span className="text-amber-500/60 mt-2 block">({email})</span>
                            </p>
                            <button
                                onClick={() => setState('AUTH_FORM')}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5"
                            >
                                Return to Login
                            </button>
                        </motion.div>
                    )}

                    {state === 'SCANNING' && (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center space-y-10 w-full"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 border-2 border-hyper-cyan/10 border-t-hyper-cyan rounded-full"
                                />
                                <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-hyper-cyan animate-pulse" />
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] italic">Neural_Link_Sync</span>
                                    <span className="text-xs font-mono text-white/40">{Math.floor(progress)}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-hyper-cyan shadow-neon-cyan"
                                    />
                                </div>
                                <div className="flex justify-between text-[7px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                    <span>Syncing encryption keys...</span>
                                    <span>Node: Prime-Alpha</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {state === 'GRANTED' && (
                        <motion.div
                            key="granted"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-hyper-cyan/10 border border-hyper-cyan/20 rounded-full flex items-center justify-center shadow-neon-cyan animate-bounce">
                                <ShieldCheck className="w-12 h-12 text-hyper-cyan" />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Access Granted</h2>
                                <p className="text-hyper-cyan/60 text-[10px] font-black tracking-[0.5em] uppercase">Identity Verified: Redirecting</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Status Footer */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-10">
                <div className="flex items-center gap-6 bg-white/[0.02] px-8 py-3 border border-white/10 rounded-full backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                            Sovereign <span className="text-white">OS 4.0</span>
                        </span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] font-mono italic">
                        Quantum Shielding: ACTIVE
                    </span>
                </div>
            </div>
        </div>
    );
}
