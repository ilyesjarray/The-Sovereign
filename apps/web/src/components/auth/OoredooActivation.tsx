'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Loader2, CheckCircle, AlertCircle, ArrowRight,
    Wifi, WifiOff, RefreshCw, Zap, Radio, Lock, Smartphone
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// =====================================================
// TYPES
// =====================================================

type ActivationState = 'idle' | 'submitting' | 'processing' | 'active' | 'failed';

interface ActivationRecord {
    id: string;
    user_id: string;
    pin_code: string;
    status: string;
    failure_reason: string | null;
    created_at: string;
}

// =====================================================
// OOREDOO ACTIVATION COMPONENT
// =====================================================

export default function OoredooActivation() {
    const [pinInput, setPinInput] = useState('');
    const [activationState, setActivationState] = useState<ActivationState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [activationId, setActivationId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // PIN validation regex — exactly 14 digits
    const PIN_REGEX = /^\d{14}$/;
    const isValidPin = PIN_REGEX.test(pinInput);

    // =====================================================
    // AUTH: Get current user
    // =====================================================

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id);
            } else {
                router.push('/en');
            }
        });
    }, []);

    // =====================================================
    // CHECK: If user already has an active/pending activation
    // =====================================================

    useEffect(() => {
        if (!userId) return;

        const checkExisting = async () => {
            // Check for already-active activation
            const { data: activeData } = await supabase
                .from('users_activation')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .limit(1);

            if (activeData && activeData.length > 0) {
                setActivationState('active');
                setTimeout(() => router.push('/en'), 2000);
                return;
            }

            // Check for pending/processing activation
            const { data: pendingData } = await supabase
                .from('users_activation')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['pending', 'processing'])
                .limit(1);

            if (pendingData && pendingData.length > 0) {
                setActivationId(pendingData[0].id);
                setActivationState('processing');
            }
        };

        checkExisting();
    }, [userId]);

    // =====================================================
    // REALTIME: Subscribe to activation status changes
    // =====================================================

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel('activation-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users_activation',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const record = payload.new as ActivationRecord;

                    if (record.status === 'active') {
                        setActivationState('active');
                        stopTimer();
                        // Instant redirect to dashboard
                        setTimeout(() => router.push('/en'), 1500);
                    } else if (record.status === 'failed') {
                        setActivationState('failed');
                        setErrorMessage(
                            record.failure_reason || 'Activation failed — please try again with a new card.'
                        );
                        stopTimer();
                    } else if (record.status === 'processing') {
                        setActivationState('processing');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // =====================================================
    // TIMER: Track elapsed processing time
    // =====================================================

    const startTimer = useCallback(() => {
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
            setElapsedTime((prev) => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);

    // =====================================================
    // SUBMIT: Insert activation record into Supabase
    // =====================================================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidPin || !userId) return;

        setActivationState('submitting');
        setErrorMessage('');

        try {
            const { data, error } = await supabase
                .from('users_activation')
                .insert({
                    user_id: userId,
                    pin_code: pinInput,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) {
                // Handle unique constraint violation (already has a pending activation)
                if (error.code === '23505') {
                    setErrorMessage('You already have a pending activation. Please wait for it to complete.');
                } else {
                    setErrorMessage(error.message);
                }
                setActivationState('failed');
                return;
            }

            setActivationId(data.id);
            setActivationState('processing');
            startTimer();
        } catch (err: any) {
            setErrorMessage(err.message || 'Failed to submit activation request.');
            setActivationState('failed');
        }
    };

    // =====================================================
    // RETRY: Allow re-submission after failure
    // =====================================================

    const handleRetry = () => {
        setPinInput('');
        setActivationState('idle');
        setErrorMessage('');
        setActivationId(null);
        setElapsedTime(0);
        inputRef.current?.focus();
    };

    // =====================================================
    // FORMAT: Display PIN with dashes for readability
    // =====================================================

    const formatPinDisplay = (pin: string): string => {
        const clean = pin.replace(/\D/g, '').slice(0, 14);
        if (clean.length <= 4) return clean;
        if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
        if (clean.length <= 12) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
        return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12)}`;
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 14);
        setPinInput(raw);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
            {/* Background atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-hyper-cyan/[0.02] blur-[150px]" />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header badge */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-hyper-cyan/10 border border-hyper-cyan/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                    >
                        <Smartphone className="w-8 h-8 text-hyper-cyan" />
                    </motion.div>

                    <h1 className="text-2xl font-black tracking-tight text-white uppercase mb-2">
                        Account <span className="text-hyper-cyan">Activation</span>
                    </h1>
                    <p className="text-sm text-white/40 font-mono">
                        Enter your 14-digit Ooredoo recharge card to activate
                    </p>
                </div>

                {/* Main card */}
                <div className="glass-v-series rounded-3xl p-8 border border-white/5 bg-white/[0.01] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
                    <AnimatePresence mode="wait">

                        {/* ========== IDLE: PIN Input Form ========== */}
                        {activationState === 'idle' && (
                            <motion.form
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {/* Ooredoo branding */}
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-red-400/80 uppercase tracking-[0.3em] font-mono">
                                        Ooredoo_Recharge_Protocol
                                    </span>
                                </div>

                                {/* PIN Input */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] font-mono pl-1">
                                        Recharge_Card_PIN
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-hyper-cyan transition-colors" />
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            placeholder="XXXX-XXXX-XXXX-XX"
                                            value={formatPinDisplay(pinInput)}
                                            onChange={handlePinChange}
                                            maxLength={17} /* 14 digits + 3 dashes */
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg font-mono font-bold text-white tracking-[0.15em] placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 focus:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all text-center"
                                            autoFocus
                                        />
                                        {/* Digit counter */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <span className={`text-xs font-mono font-bold transition-colors ${
                                                pinInput.length === 14
                                                    ? 'text-emerald-400'
                                                    : pinInput.length > 0
                                                        ? 'text-amber-400'
                                                        : 'text-white/20'
                                            }`}>
                                                {pinInput.length}/14
                                            </span>
                                        </div>
                                    </div>

                                    {/* Validation hint */}
                                    {pinInput.length > 0 && !isValidPin && (
                                        <p className="text-[10px] font-mono text-amber-400/60 pl-1">
                                            Enter exactly 14 digits from your Ooredoo recharge card
                                        </p>
                                    )}
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={!isValidPin}
                                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed bg-hyper-cyan/10 border border-hyper-cyan/30 text-hyper-cyan hover:bg-hyper-cyan/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] active:scale-[0.98]"
                                >
                                    <Zap className="w-4 h-4" />
                                    Activate Account
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {/* Security notice */}
                                <div className="flex items-center gap-2 justify-center">
                                    <Shield className="w-3 h-3 text-white/10" />
                                    <p className="text-[9px] font-mono text-white/15 uppercase tracking-widest">
                                        End-to-end encrypted • Single-use PIN
                                    </p>
                                </div>
                            </motion.form>
                        )}

                        {/* ========== SUBMITTING: Brief loading ========== */}
                        {activationState === 'submitting' && (
                            <motion.div
                                key="submitting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-12 flex flex-col items-center gap-4"
                            >
                                <Loader2 className="w-8 h-8 text-hyper-cyan animate-spin" />
                                <p className="text-sm font-mono text-white/40">Submitting...</p>
                            </motion.div>
                        )}

                        {/* ========== PROCESSING: USSD in progress ========== */}
                        {activationState === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="py-8 space-y-8"
                            >
                                {/* Animated signal visualization */}
                                <div className="flex justify-center">
                                    <div className="relative w-24 h-24">
                                        {/* Pulsing rings */}
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute inset-0 rounded-full border border-hyper-cyan/20"
                                                animate={{
                                                    scale: [1, 1.5 + i * 0.3],
                                                    opacity: [0.4, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.6,
                                                    ease: 'easeOut',
                                                }}
                                            />
                                        ))}
                                        {/* Center icon */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                                className="w-16 h-16 rounded-full border-2 border-hyper-cyan/30 border-t-hyper-cyan flex items-center justify-center"
                                            >
                                                <Wifi className="w-6 h-6 text-hyper-cyan" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status text */}
                                <div className="text-center space-y-3">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        Processing with <span className="text-red-400">Ooredoo</span>
                                    </h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <motion.div
                                            className="w-1.5 h-1.5 rounded-full bg-hyper-cyan"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <p className="text-xs font-mono text-white/30">
                                            Executing USSD recharge protocol...
                                        </p>
                                    </div>
                                </div>

                                {/* Progress steps */}
                                <div className="space-y-3 px-2">
                                    {[
                                        { label: 'PIN received', done: true },
                                        { label: 'Connecting to Ooredoo', done: elapsedTime > 2 },
                                        { label: 'Processing recharge', done: elapsedTime > 5 },
                                        { label: 'Awaiting confirmation', done: false },
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            {step.done ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                            ) : (
                                                <motion.div
                                                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                                                    animate={i === 3 ? { borderColor: ['rgba(255,255,255,0.2)', 'rgba(0,240,255,0.5)', 'rgba(255,255,255,0.2)'] } : {}}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                            )}
                                            <span className={`text-xs font-mono ${
                                                step.done ? 'text-white/60' : 'text-white/20'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Elapsed timer */}
                                <div className="text-center">
                                    <span className="text-[10px] font-mono text-white/15 uppercase tracking-widest">
                                        Elapsed: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== ACTIVE: Success ========== */}
                        {activationState === 'active' && (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="py-12 text-center space-y-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                                >
                                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                                </motion.div>

                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                                        Activation <span className="text-emerald-400">Successful</span>
                                    </h3>
                                    <p className="text-sm text-white/40 font-mono">
                                        Your account is now active and ready
                                    </p>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-3 h-3 text-hyper-cyan animate-spin" />
                                    <p className="text-[10px] font-mono text-hyper-cyan/60 uppercase tracking-widest">
                                        Redirecting to Command Center...
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== FAILED: Error with retry ========== */}
                        {activationState === 'failed' && (
                            <motion.div
                                key="failed"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="py-8 space-y-6"
                            >
                                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        Activation <span className="text-red-400">Failed</span>
                                    </h3>
                                    <div className="px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <p className="text-xs font-mono text-red-400/80 leading-relaxed">
                                            {errorMessage}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRetry}
                                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:border-hyper-cyan/30 hover:bg-hyper-cyan/5"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again with New Card
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer link */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/en')}
                        className="text-[10px] font-mono text-white/15 hover:text-white/40 uppercase tracking-widest transition-colors"
                    >
                        ← Return to Command Center
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
