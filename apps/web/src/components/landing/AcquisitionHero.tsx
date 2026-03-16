'use client';

import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Globe, Zap, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';

export function AcquisitionHero() {
    const [particles, setParticles] = useState<Array<{ r: number, x: number, y: number, duration: number }>>([]);

    useEffect(() => {
        setParticles([...Array(50)].map(() => ({
            r: Math.random() * 2,
            x: Math.random() * 1920,
            y: Math.random() * 1080,
            duration: 5 + Math.random() * 10
        })));
    }, []);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center p-10 overflow-hidden bg-carbon-black">
            {/* Quantum Background Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg className="w-full h-full">
                    {particles.map((p, i) => (
                        <motion.circle
                            key={i}
                            r={p.r}
                            fill="#00f0ff"
                            initial={{ x: p.x, y: p.y }}
                            animate={{
                                y: [null, p.y],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ duration: p.duration, repeat: Infinity }}
                        />
                    ))}
                </svg>
            </div>

            {/* Glowing Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hyper-cyan/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl w-full relative z-10 text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex items-center gap-4 px-6 py-2 rounded-full border border-hyper-cyan/20 bg-hyper-cyan/5 backdrop-blur-xl">
                        <ShieldCheck className="w-4 h-4 text-hyper-cyan animate-pulse" />
                        <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] font-mono">
                            EXCLUSIVE_IP_ACQUISITION_PROTOCOL_V4
                        </span>
                    </div>

                    <h1 className="text-8xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.85] text-balance">
                        Own the Future of <br />
                        <span className="text-hyper-cyan drop-shadow-neon-cyan">Sovereign Intelligence</span>
                    </h1>

                    <p className="max-w-2xl text-xl text-white/40 font-bold italic leading-relaxed uppercase tracking-wide">
                        The world's first predictive operating system. Built for global elites. Unified by real-time neural data. Ready for exclusive enterprise takeover.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-8"
                >
                    <button className="group relative px-16 py-8 bg-hyper-cyan text-carbon-black rounded-[2rem] font-black text-lg uppercase tracking-[0.4em] shadow-neon-cyan hover:bg-white transition-all italic overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center gap-4">
                            Request Acquisition Briefing
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                    </button>

                    <div className="flex items-center gap-6 px-10 py-6 border border-white/5 rounded-[2rem] bg-white/[0.01] backdrop-blur-md">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">Current_IP_Valuation</span>
                            <span className="text-3xl font-black text-white italic tracking-tighter">$120,000+</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10" />
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Zap className="text-emerald-500 w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                {/* Tech Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20"
                >
                    {[
                        { icon: Cpu, label: 'Groq Llama-3.3', detail: 'Neural_Core' },
                        { icon: Globe, label: 'Real-Time Web', detail: 'Dynamic_Flux' },
                        { icon: Zap, label: 'Next.js 15', detail: 'Quantum_Uplink' },
                        { icon: ShieldCheck, label: 'Supabase E2E', detail: 'Vault_Secure' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 p-8 glass-v-series rounded-[2.5rem] bg-white/[0.01] border border-white/5 group hover:border-hyper-cyan/20 transition-all">
                            <item.icon className="w-10 h-10 text-white/10 group-hover:text-hyper-cyan transition-colors" />
                            <div className="space-y-1">
                                <div className="text-sm font-black text-white italic tracking-tight">{item.label}</div>
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">{item.detail}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
