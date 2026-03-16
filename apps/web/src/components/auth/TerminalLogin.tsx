'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Lock, Fingerprint, Globe, Wallet, Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ImperialButton } from '../ui/ImperialButton';

export function TerminalLogin() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleBiometricAuth = async () => {
        setIsAuthenticating(true);
        try {
            // Simulated WebAuthn for demo (would be real implementation in production)
            toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                loading: 'SCANNING_BIOMETRICS...',
                success: 'QUANTUM_IDENTITY_VERIFIED',
                error: 'BIOMETRIC_MISMATCH'
            });
            setTimeout(() => {
                router.push('/terminal');
                router.refresh();
            }, 2500);
        } catch (err) {
            console.error('Biometric error:', err);
            setIsAuthenticating(false);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthenticating(true);

        try {
            if (mode === 'LOGIN') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('ACCESS_GRANTED', { description: 'Welcome back, Commander.' });
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                toast.success('CITIZENSHIP_RECORDED', { description: 'Check your comms (email) for verification.' });
            }

            if (mode === 'LOGIN') {
                router.push('/terminal');
                router.refresh();
            }
        } catch (error: any) {
            toast.error('ACCESS_DENIED', { description: error.message });
            setIsAuthenticating(false);
        }
    };

    const handleWalletLogin = async () => {
        if (typeof window === 'undefined' || !(window as any).solana) {
            window.open('https://phantom.app/', '_blank');
            return toast.error('GHOST_NODE_MISSING', { description: 'Phantom Wallet required for Web3 Key.' });
        }

        setIsAuthenticating(true);
        try {
            const resp = await (window as any).solana.connect();
            toast.success('WEB3_HANDSHAKE_COMPLETE', { description: `Key: ${resp.publicKey.toString().slice(0, 8)}...` });
            router.push('/terminal');
        } catch (err) {
            toast.error('CONNECTION_REJECTED');
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black font-mono">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-blue/5 blur-[150px] rounded-none" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-black/60 backdrop-blur-3xl border border-neon-blue/20 p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
                    {/* HUD Scan Line Detail */}
                    <motion.div
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-[1px] bg-neon-blue/5 z-0 pointer-events-none"
                    />

                    {/* Header */}
                    <div className="text-center mb-10 relative z-10">
                        <motion.div
                            animate={{
                                boxShadow: ["0 0 10px rgba(212,175,55,0.1)", "0 0 30px rgba(212,175,55,0.3)", "0 0 10px rgba(212,175,55,0.1)"]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-16 h-16 mx-auto mb-6 border border-neon-blue flex items-center justify-center bg-black"
                        >
                            <Shield className="w-8 h-8 text-neon-blue shadow-glow-gold" />
                        </motion.div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">
                            {mode === 'LOGIN' ? 'IDENTIFY_SELF' : 'REQUEST_CITIZENSHIP'}
                        </h1>
                        <p className="text-neon-blue/40 text-[9px] tracking-[0.4em] font-mono uppercase">
                            SOVEREIGN_ACCESS_NODE_ZULU_Ω
                        </p>
                    </div>

                    {/* Main Form */}
                    <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-neon-blue/40 tracking-[0.3em] ml-1">COMMS_ID_Ω</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="IDENTITY@SOVEREIGN.EMPIRE"
                                    className="w-full bg-black border border-neon-blue/20 p-4 text-[10px] font-mono text-neon-blue uppercase tracking-wider focus:outline-none focus:border-neon-blue transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-neon-blue/40 tracking-[0.3em] ml-1">ACCESS_PHRASE</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="CRYPTO_KEY_8X..."
                                    className="w-full bg-black border border-neon-blue/20 p-4 text-[10px] font-mono text-neon-blue uppercase tracking-wider focus:outline-none focus:border-neon-blue transition-all"
                                />
                            </div>
                        </div>

                        <button
                            disabled={isAuthenticating}
                            className="w-full py-5 bg-neon-blue text-black font-black uppercase tracking-[0.6em] text-[10px] italic hover:bg-white transition-all disabled:opacity-20 flex items-center justify-center gap-2 group"
                        >
                            {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {mode === 'LOGIN' ? 'AUTHENTICATE' : 'INITIALIZE_RECORD'}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Alternate Access Methods */}
                    <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                        <button
                            onClick={handleWalletLogin}
                            type="button"
                            className="flex flex-col items-center justify-center gap-3 p-4 border border-neon-blue/10 bg-black/40 hover:bg-neon-blue/5 hover:border-neon-blue/30 transition-all group"
                        >
                            <Wallet className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] text-white/40 tracking-[0.3em] font-mono uppercase italic group-hover:text-neon-blue">PHANTOM_LINK</span>
                        </button>
                        <button
                            onClick={async () => {
                                setIsAuthenticating(true);
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                });
                                if (error) {
                                    toast.error('GOOGLE_LINK_FAILED');
                                    setIsAuthenticating(false);
                                }
                            }}
                            type="button"
                            className="flex flex-col items-center justify-center gap-3 p-4 border border-neon-blue/10 bg-black/40 hover:bg-neon-blue/5 hover:border-neon-blue/30 transition-all group"
                        >
                            <Globe className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] text-white/40 tracking-[0.3em] font-mono uppercase italic group-hover:text-neon-blue">GOOGLE_ID</span>
                        </button>
                    </div>

                    {/* Biometric Quick Entry */}
                    <div className="mt-6 relative z-10">
                        <button
                            onClick={handleBiometricAuth}
                            className="w-full py-4 border border-sovereign-blue/20 text-sovereign-blue text-[9px] font-black uppercase tracking-[0.5em] hover:bg-sovereign-blue/5 transition-all italic flex items-center justify-center gap-3 group"
                        >
                            <Fingerprint className="w-4 h-4 group-hover:animate-pulse" />
                            BYPASS_WITH_BIOMETRICS
                        </button>
                    </div>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center relative z-10">
                        <button
                            onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                            className="text-[9px] text-neon-blue/20 hover:text-neon-blue transition-colors tracking-[0.4em] uppercase font-mono italic"
                        >
                            {mode === 'LOGIN' ? 'NO_CLEARANCE? REQUEST_AUTHORIZATION' : 'HAS_CLEARANCE? EXECUTE_HANDSHAKE'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
