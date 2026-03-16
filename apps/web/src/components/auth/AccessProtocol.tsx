'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ShieldCheck, Lock, Cpu, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AccessProtocol() {
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'GRANTED'>('IDLE');
    const [matrixData, setMatrixData] = useState<string[]>([]);
    const router = useRouter();

    // Simulate matrix data stream
    useEffect(() => {
        if (status === 'VERIFYING') {
            const interval = setInterval(() => {
                const hex = Math.random().toString(16).substring(2, 10).toUpperCase();
                setMatrixData(prev => [hex, ...prev].slice(0, 15));
            }, 50);
            return () => clearInterval(interval);
        }
    }, [status]);

    const handleIdentify = async () => {
        setStatus('SCANNING');

        // Simulate physical feedback / sound with vibration if available
        if ("vibrate" in navigator) {
            navigator.vibrate([10, 30, 10, 30, 50]);
        }

        // [V4.0] Simulated Hydraulic Hiss
        console.log('[AccessProtocol] HYDRAULIC_HISS_SEQUENCE_START');

        setTimeout(() => {
            setStatus('VERIFYING');

            setTimeout(() => {
                setStatus('GRANTED');
                toast.success('IDENTITY_VERIFIED', {
                    description: 'Sovereignty Guaranteed. Welcome back.',
                    className: 'bg-black border border-neon-blue text-neon-blue font-mono',
                });

                setTimeout(() => {
                    router.push('/war-room');
                    router.refresh();
                }, 1500);
            }, 1000); // [V4.0] Faster verification
        }, 800); // [V4.0] Faster scan
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999] overflow-hidden">
            {/* HUD Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none data-grid-bg" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none scanline-effect opacity-20" />

            <AnimatePresence mode="wait">
                {status === 'IDLE' || status === 'SCANNING' ? (
                    <motion.div
                        key="auth-trigger"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div
                            onClick={status === 'IDLE' ? handleIdentify : undefined}
                            className={`
                                relative w-64 h-64 flex items-center justify-center cursor-pointer
                                rounded-full border border-neon-blue/20 group transition-all duration-500
                                ${status === 'SCANNING' ? 'scale-110 border-neon-blue shadow-[0_0_50px_rgba(212,175,55,0.3)]' : 'hover:border-neon-blue/50'}
                            `}
                        >
                            {/* [V4.0] Pulsing GOLD Aura */}
                            <div className={`absolute inset-4 aura-gold ${status === 'SCANNING' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />

                            <motion.div
                                animate={status === 'SCANNING' ? {
                                    scale: [1, 1.05, 1],
                                    opacity: [0.5, 1, 0.5],
                                } : {}}
                                transition={{ repeat: Infinity, duration: 0.5 }} // [V4.0] Faster pulse
                            >
                                <Fingerprint
                                    className={`w-32 h-32 transition-colors duration-500 
                                    ${status === 'SCANNING' ? 'text-neon-blue' : 'text-amber-900 group-hover:text-amber-600'}`}
                                />
                            </motion.div>

                            {/* Decorative HUD Elements */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-neon-blue/10 animate-[spin_20s_linear_infinite]" />
                            <div className="absolute -inset-8 border border-neon-blue/5 rounded-full" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-12 text-center"
                        >
                            <h2 className="text-neon-blue text-2xl font-black tracking-[0.5em] uppercase mb-2">
                                {status === 'IDLE' ? 'IDENTIFY_SELF' : 'ACQUIRING_BIOMETRICS'}
                            </h2>
                            <p className="text-neon-blue/40 text-[10px] tracking-[0.3em] font-mono">
                                {status === 'IDLE' ? 'TAP_SENSOR_FOR_SOVEREIGN_ACCESS' : 'INITIALIZING_CRYPTO_HANDSHAKE...'}
                            </p>
                        </motion.div>
                    </motion.div>
                ) : status === 'VERIFYING' ? (
                    <motion.div
                        key="verifying"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full max-w-2xl px-6 relative z-10"
                    >
                        <div className="hud-border bg-black/80 p-8 backdrop-blur-xl">
                            <div className="flex items-center gap-6 mb-8 border-b border-neon-blue/20 pb-6">
                                <Cpu className="w-12 h-12 text-neon-blue animate-pulse" />
                                <div>
                                    <h3 className="text-neon-blue text-lg font-bold tracking-widest uppercase">
                                        Handshake_Protocol_Alpha
                                    </h3>
                                    <div className="flex gap-2 text-[10px] text-neon-blue/50 font-mono">
                                        <span>ENCRYPT_STRENGTH: 512B_QUANTUM</span>
                                        <span>|</span>
                                        <span>ORIGIN: SOVEREIGN_OS_CORE</span>
                                    </div>
                                </div>
                            </div>

                            {/* [V4.0] Insane Speed Matrix Stream */}
                            <div className="grid grid-cols-3 gap-2 h-48 overflow-hidden font-mono text-[10px] text-neon-blue/60 opacity-50">
                                {matrixData.map((hex, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-top-1 duration-100">
                                        {`0x${hex}_BLOCK_VERIFIED`}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex items-center justify-between border-t border-neon-blue/20 pt-6">
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 bg-neon-blue animate-pulse" />
                                    <div className="w-2 h-2 bg-neon-blue/40" />
                                    <div className="w-2 h-2 bg-neon-blue/20" />
                                </div>
                                <span className="text-neon-blue text-xs tracking-widest animate-pulse font-black">
                                    DECRYPTING_SOVEREIGN_VAULT...
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="granted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center z-10"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0],
                            }}
                            className="w-32 h-32 bg-neon-blue rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(212,175,55,0.6)]"
                        >
                            <ShieldCheck className="w-16 h-16 text-black" />
                        </motion.div>
                        <h1 className="mt-12 text-neon-blue text-4xl font-black tracking-[1rem] uppercase animate-pulse">
                            ACCESS_GRANTED
                        </h1>
                        <p className="mt-4 text-neon-blue/60 font-mono tracking-widest uppercase">
                            Redirecting to War Room...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner Decorative Elements */}
            <div className="absolute top-8 left-8 w-24 h-24 border-t-2 border-l-2 border-neon-blue/20 rounded-none pointer-events-none" />
            <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-neon-blue/20 rounded-none pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-neon-blue/20 rounded-none pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-neon-blue/20 rounded-none pointer-events-none" />

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-30">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] text-neon-blue font-mono tracking-widest uppercase">SOVEREIGN_V4_ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neon-blue" />
                    <span className="text-[10px] text-neon-blue font-mono tracking-widest uppercase">E2EE_ENCRYPTION_SAFE</span>
                </div>
            </div>
        </div>
    );
}
