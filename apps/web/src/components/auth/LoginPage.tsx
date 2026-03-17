'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Chrome, Loader2, CheckCircle, AlertCircle, Shield, Zap, Globe, Hexagon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { BrowserProvider } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

type Mode = 'login' | 'register' | 'choose' | 'magic' | 'sent';

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>('choose');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            window.location.href = '/dashboard';
        }
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { 
                data: { full_name: fullName },
                emailRedirectTo: `${window.location.origin}/auth/callback` 
            }
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMode('sent');
        }
    };

    const handleGoogleOAuth = async () => {
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) { setError(error.message); setLoading(false); }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setMode('sent');
        }
    };

    const handleWeb3Login = async () => {
        try {
            setError('');
            if (!window.ethereum) {
                setError('No Web3 Provider detected. Please install MetaMask or Phantom.');
                return;
            }
            setLoading(true);
            const provider = new BrowserProvider(window.ethereum as any);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            // Re-authenticate logic: Sign a message to prove ownership
            const message = `Sovereign OS Authentication.\nTimestamp: ${Date.now()}\nAddress: ${address}`;
            await signer.signMessage(message);

            // Use the address to create a seamless account via Supabase
            const web3Email = `${address.toLowerCase()}@web3.sovereign.os`;
            const web3Password = `W3b3_${address.toLowerCase()}_SecureKey`;

            let { error: authError } = await supabase.auth.signInWithPassword({
                email: web3Email,
                password: web3Password,
            });

            if (authError && authError.message.includes('Invalid login credentials')) {
                // If account doesn't exist, sign up
                const { error: signUpError } = await supabase.auth.signUp({
                    email: web3Email,
                    password: web3Password,
                    options: { data: { is_web3: true, wallet_address: address } }
                });
                if (signUpError) throw signUpError;
                // Retry sign-in after signup
                authError = (await supabase.auth.signInWithPassword({
                    email: web3Email,
                    password: web3Password,
                })).error;
            }

            if (authError) throw authError;

            // Successful login, wait for Next.js to redirect or push
            window.location.href = '/dashboard';

        } catch (err: any) {
            console.error('Web3 Login Error:', err);
            setError(err.reason || err.message || 'Web3 authentication failed.');
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex overflow-hidden bg-black"
        >
            {/* --- Left Brand Panel --- */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
            >
                {/* Background Atmosphere */}
                <div className="absolute inset-0 bg-black" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div
                    className="absolute top-0 left-0 w-64 h-64 rounded-none blur-[100px] pointer-events-none bg-neon-blue/5"
                />
                <div
                    className="absolute bottom-0 right-0 w-80 h-80 rounded-none blur-[120px] pointer-events-none bg-sovereign-blue/5"
                />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-12 h-12 rounded-none border border-neon-blue flex items-center justify-center bg-black shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        >
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <span
                            className="text-sm font-black tracking-[0.4em] uppercase text-neon-blue italic"
                        >
                            THE_SOVEREIGN
                        </span>
                    </div>
                </div>

                {/* Main Brand Copy */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1
                            className="text-5xl font-black leading-tight tracking-tight mb-4"
                            style={{ color: 'var(--ivory)' }}
                        >
                            Total<br />
                            <span style={{ color: 'var(--gold)' }}>Independence.</span>
                        </h1>
                        <p className="text-base leading-relaxed max-w-sm" style={{ color: 'var(--ivory-dim)' }}>
                            A mobile command center that transfers power from institutions
                            directly into your hands. One platform. Infinite sovereignty.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: <Globe className="w-4 h-4" />, text: 'Global Intelligence — real-time worldwide analysis' },
                            { icon: <Zap className="w-4 h-4" />, text: '5 Command Centers — all your operations in one place' },
                            { icon: <Shield className="w-4 h-4" />, text: 'Military-grade privacy — encrypted at every layer' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'rgba(200,169,110,0.1)', color: 'var(--gold)' }}
                                >
                                    {item.icon}
                                </div>
                                <span className="text-sm" style={{ color: 'var(--ivory-dim)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom watermark */}
                <div className="relative z-10">
                    <div className="gold-divider mb-4" />
                    <p className="text-xs tracking-[0.15em] uppercase" style={{ color: 'rgba(200,169,110,0.3)' }}>
                        Sovereign Executive Shell · v5.0
                    </p>
                </div>
            </motion.div>

            {/* --- Right Auth Panel --- */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 flex items-center justify-center p-6 lg:p-14"
            >
                <div className="w-full max-w-sm space-y-8">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-4 mb-12">
                        <div
                            className="w-12 h-12 rounded-none border border-neon-blue flex items-center justify-center bg-black shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        >
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <span className="text-sm font-black tracking-[0.3em] uppercase text-neon-blue italic">
                            THE_SOVEREIGN
                        </span>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* --- Mode: Login --- */}
                        {mode === 'login' && (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2 uppercase" style={{ color: 'var(--ivory)' }}>
                                        Sign In
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--ivory-dim)' }}>
                                        Enter your credentials to access the Sovereign OS.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div>
                                        <label className="sovereign-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="sovereign-input"
                                            placeholder="you@protonmail.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="sovereign-label">Password</label>
                                        <input
                                            type="password"
                                            className="sovereign-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid rgba(224,82,82,0.2)' }}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !email.trim() || !password.trim()}
                                        className="sovereign-btn sovereign-btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>

                                <div className="text-center space-y-2">
                                    <button onClick={() => { setMode('choose'); setError(''); }} className="text-xs text-white/40 hover:text-white transition-colors">← Other methods</button>
                                    <br />
                                    <button onClick={() => { setMode('register'); setError(''); }} className="text-xs text-neon-blue/60 hover:text-neon-blue transition-colors">No account? Create one →</button>
                                </div>
                            </motion.div>
                        )}

                        {/* --- Mode: Register --- */}
                        {mode === 'register' && (
                            <motion.div
                                key="register"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2 uppercase" style={{ color: 'var(--ivory)' }}>
                                        Create Account
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--ivory-dim)' }}>
                                        Register to gain access to the Sovereign OS.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailRegister} className="space-y-4">
                                    <div>
                                        <label className="sovereign-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="sovereign-input"
                                            placeholder="Commander Name"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="sovereign-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="sovereign-input"
                                            placeholder="you@protonmail.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="sovereign-label">Password (8+ characters)</label>
                                        <input
                                            type="password"
                                            className="sovereign-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid rgba(224,82,82,0.2)' }}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !email.trim() || !password.trim()}
                                        className="sovereign-btn sovereign-btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <button onClick={() => { setMode('login'); setError(''); }} className="text-xs text-white/40 hover:text-white transition-colors">Already have an account? Sign in</button>
                                </div>
                            </motion.div>
                        )}

                        {/* --- Mode: Choose --- */}
                        {mode === 'choose' && (
                            <motion.div
                                key="choose"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Key Verified</span>
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--ivory)' }}>
                                        Enter the Command
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--ivory-dim)' }}>
                                        Sign in to initialize your sovereign operations.
                                    </p>
                                </div>


                                {/* Google OAuth */}
                                <button
                                    onClick={handleGoogleOAuth}
                                    disabled={loading}
                                    className="sovereign-btn sovereign-btn-primary w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    Continue with Google
                                </button>

                                {/* Web3 Option */}
                                <button
                                    onClick={handleWeb3Login}
                                    disabled={loading}
                                    className="sovereign-btn w-full text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed border border-neon-blue/40 bg-neon-blue/5 hover:bg-neon-blue/20 text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_25px_rgba(0,243,255,0.3)]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Hexagon className="w-5 h-5 text-neon-blue fill-neon-blue/20" />
                                    )}
                                    Connect Web3 Wallet
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 gold-divider" />
                                    <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--ivory-dim)', opacity: 0.5 }}>or</span>
                                    <div className="flex-1 gold-divider" />
                                </div>

                                {/* Magic Link option */}
                                <button
                                    onClick={() => setMode('magic')}
                                    className="sovereign-btn sovereign-btn-ghost w-full text-sm py-3"
                                >
                                    <Mail className="w-4 h-4" />
                                    Sign in with Email Link
                                </button>

                                <button
                                    onClick={() => setMode('login')}
                                    className="sovereign-btn sovereign-btn-ghost w-full text-sm py-3 border border-white/10"
                                >
                                    Sign In with Password
                                </button>
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-xs text-center text-white/30 hover:text-white transition-colors w-full py-1"
                                >
                                    Create a new account →
                                </button>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid rgba(224,82,82,0.2)' }}>
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(232,222,204,0.25)' }}>
                                    By continuing you agree to our Terms of Service.<br />
                                    Your identity is protected at all times.
                                </p>
                            </motion.div>
                        )}

                        {/* --- Mode: Magic Link --- */}
                        {mode === 'magic' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                <div>
                                    <button
                                        onClick={() => { setMode('choose'); setError(''); setPassword(''); }}
                                        className="flex items-center gap-2 text-xs mb-4 transition-opacity hover:opacity-100 opacity-50"
                                        style={{ color: 'var(--ivory-dim)' }}
                                    >
                                        ← Back
                                    </button>
                                    <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--ivory)' }}>
                                        Secure Email Link
                                    </h2>
                                    <p className="text-sm" style={{ color: 'var(--ivory-dim)' }}>
                                        Enter your email. We&apos;ll send a one-time secure link — no password needed.
                                    </p>
                                </div>

                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div>
                                        <label className="sovereign-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="sovereign-input"
                                            placeholder="you@protonmail.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(224,82,82,0.1)', color: 'var(--danger)', border: '1px solid rgba(224,82,82,0.2)' }}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !email.trim()}
                                        className="sovereign-btn sovereign-btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Send Secure Link <ArrowRight className="w-4 h-4 ml-1" /></>
                                        )}
                                    </button>
                                </form>

                                <p className="text-xs" style={{ color: 'rgba(232,222,204,0.25)' }}>
                                    Works with any email provider including ProtonMail & Tutanota.
                                </p>
                            </motion.div>
                        )}

                        {/* --- Mode: Link Sent --- */}
                        {mode === 'sent' && (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-6 text-center"
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                                    style={{ background: 'rgba(62,207,142,0.12)', border: '1px solid rgba(62,207,142,0.25)' }}
                                >
                                    <CheckCircle className="w-8 h-8" style={{ color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--ivory)' }}>
                                        Check Your Inbox
                                    </h2>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                                        A secure access link has been sent to<br />
                                        <strong style={{ color: 'var(--gold)' }}>{email}</strong>
                                    </p>
                                </div>
                                <p className="text-xs" style={{ color: 'rgba(232,222,204,0.25)' }}>
                                    The link expires in 1 hour. No password is stored.
                                </p>
                                <button
                                    onClick={() => { setMode('choose'); setEmail(''); setError(''); }}
                                    className="sovereign-btn sovereign-btn-ghost w-full text-sm py-3"
                                >
                                    Use a different method
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
