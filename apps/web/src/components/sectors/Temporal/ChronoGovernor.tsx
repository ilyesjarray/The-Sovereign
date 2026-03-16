'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Zap, Shield, User, ChevronRight, Layout, Activity, Sparkles, UserCheck, Briefcase, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChronoGovernor() {
    const [executiveMode, setExecutiveMode] = useState(true);
    const [focusMode, setFocusMode] = useState(false);

    const businessMandates = [
        { id: 1, title: 'Employee Performance Audit', priority: 'High', status: 'In Progress', icon: UserCheck },
        { id: 2, title: 'Strategic Partnership Sync', priority: 'Medium', status: 'Scheduled', icon: Briefcase },
        { id: 3, title: 'Revenue Stream Optimization', priority: 'Ultra', status: 'AI Managing', icon: Zap },
    ];

    return (
        <div className={cn(
            "flex-1 flex flex-col gap-8 p-10 overflow-hidden font-sans transition-all duration-1000 relative",
            focusMode ? "bg-black" : "bg-carbon-black"
        )}>
            {/* Temporal Wave Visualizer (Background) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                <svg className="w-full h-full">
                    <motion.path
                        d="M0 150 Q 300 100 600 150 T 1200 150 T 1800 150"
                        fill="none"
                        stroke="rgba(0, 240, 255, 0.3)"
                        strokeWidth="1"
                        animate={{
                            d: [
                                "M0 150 Q 300 100 600 150 T 1200 150 T 1800 150",
                                "M0 150 Q 300 200 600 150 T 1200 150 T 1800 150",
                                "M0 150 Q 300 100 600 150 T 1200 150 T 1800 150"
                            ]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M0 160 Q 400 110 800 160 T 1600 160"
                        fill="none"
                        stroke="rgba(0, 240, 255, 0.1)"
                        strokeWidth="0.5"
                        animate={{
                            d: [
                                "M0 160 Q 400 110 800 160 T 1600 160",
                                "M0 160 Q 400 210 800 160 T 1600 160",
                                "M0 160 Q 400 110 800 160 T 1600 160"
                            ]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </svg>
            </div>

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {focusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-0 bg-hyper-cyan/[0.01] pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,186,211,0.05)_0%,transparent_70%)]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header - V-Series Blue */}
            <div className="flex flex-col space-y-2 relative z-10 text-hud">
                <div className="flex items-center gap-2 text-hyper-cyan">
                    <Clock size={14} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] font-mono">TEMPORAL_GOVERNOR_V4.8</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Chrono Governor</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-mono mt-2 italic">Sector: TIME_MASTERY // EXECUTIVE_ORCHESTRATION</p>
                    </div>
                    <div className="flex items-center gap-6 glass-v-series px-8 py-4 rounded-2xl bg-white/[0.01] border border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] text-white/30 uppercase font-black font-mono">Focus</span>
                                <button
                                    onClick={() => setFocusMode(!focusMode)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative border border-white/10",
                                        focusMode ? "bg-amber-500 shadow-neon-amber" : "bg-white/5"
                                    )}
                                >
                                    <motion.div
                                        animate={{ x: focusMode ? 26 : 4 }}
                                        className={cn("w-4 h-4 rounded-full absolute top-1", focusMode ? "bg-carbon-black" : "bg-white/40")}
                                    />
                                </button>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] text-white/30 uppercase font-black font-mono">Executive</span>
                                <button
                                    onClick={() => setExecutiveMode(!executiveMode)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative border border-white/10",
                                        executiveMode ? "bg-hyper-cyan shadow-neon-cyan" : "bg-white/5"
                                    )}
                                >
                                    <motion.div
                                        animate={{ x: executiveMode ? 26 : 4 }}
                                        className={cn("w-4 h-4 rounded-full absolute top-1", executiveMode ? "bg-carbon-black" : "bg-white/40")}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0 relative z-10">
                {/* Executive Mandates Feed */}
                <div className="flex-[1.5] flex flex-col gap-8">
                    <div className="flex-1 glass-v-series rounded-[2.5rem] p-10 flex flex-col gap-8 relative overflow-hidden group bg-white/[0.02] border border-white/10">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <Calendar size={200} />
                        </div>

                        <div className="flex items-center justify-between font-mono">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Business_Mandates_Orchestration</span>
                                <div className="h-[1px] w-24 bg-white/10" />
                            </div>
                            <Sparkles size={18} className="text-hyper-cyan/40" />
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-4">
                            {businessMandates.map((m) => {
                                const Icon = m.icon;
                                return (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-hyper-cyan/30 transition-all duration-700 group/card relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-hyper-cyan/[0.02] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 glass-v-series rounded-2xl flex items-center justify-center border border-white/5 group-hover/card:border-hyper-cyan/40 group-hover/card:shadow-neon-cyan/20 transition-all duration-500">
                                                    <Icon size={24} className="text-hyper-cyan" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest font-mono mb-1 italic">Mandate_Identifier: {m.id}</span>
                                                    <span className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover/card:text-hyper-cyan transition-colors">{m.title}</span>
                                                    <div className="flex items-center gap-6 mt-2">
                                                        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", m.priority === 'Ultra' ? "bg-amber-500 shadow-neon-amber" : "bg-hyper-cyan")} />
                                                            <span className="text-[9px] text-white/60 font-black uppercase tracking-widest font-mono">{m.priority}</span>
                                                        </div>
                                                        <span className="text-[9px] text-hyper-cyan font-black uppercase tracking-widest font-mono animate-pulse">{m.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="px-10 py-4 bg-hyper-cyan text-carbon-black hover:bg-white transition-all font-black text-[10px] uppercase tracking-[0.4em] rounded-xl italic shadow-neon-cyan">
                                                Execute
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Secretary AI Insight */}
                    <div className="h-44 glass-v-series rounded-[2.5rem] p-10 bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center gap-10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-hyper-cyan/20 to-transparent opacity-50" />
                        <div className="w-20 h-20 rounded-2xl bg-carbon-black flex items-center justify-center shrink-0 border border-hyper-cyan/40 shadow-neon-cyan relative z-10">
                            <Star className="text-hyper-cyan animate-spin-slow" size={32} />
                        </div>
                        <div className="flex-1 relative z-10">
                            <h4 className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] font-mono mb-3 flex items-center gap-3">
                                <Sparkles size={14} className="animate-spin-slow" /> EXECUTIVE_SECRETARY // INTEL_CORRELATION
                            </h4>
                            <p className="text-lg text-white/70 font-bold leading-relaxed italic">
                                AI suggests rescheduling <span className="text-hyper-cyan">Strategic Sync</span> to 14:00 UTC. Aligning with peak institutional liquidity windows.
                            </p>
                        </div>
                        <button className="relative z-10 px-10 py-4 bg-hyper-cyan text-carbon-black hover:bg-white font-black text-[10px] uppercase tracking-[0.4em] rounded-xl transition-all shadow-neon-cyan italic">
                            Approve
                        </button>
                    </div>
                </div>

                {/* Temporal Side Panel */}
                <div className="flex-1 flex flex-col gap-8 min-w-[400px]">
                    <div className="glass-v-series rounded-[2.5rem] p-10 flex flex-col gap-10 bg-white/[0.01] border border-white/10 items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hyper-cyan/40 to-transparent" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] font-mono">System Time Mastery</span>

                        <div className="relative w-64 h-64 border-[4px] border-white/5 rounded-full flex items-center justify-center bg-black/20">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-[4px] border-hyper-cyan rounded-full shadow-neon-cyan"
                            />
                            <div className="flex flex-col">
                                <span className="text-6xl font-black text-white italic tracking-tighter drop-shadow-neon-cyan">15:42</span>
                                <span className="text-xs text-hyper-cyan font-black tracking-[0.3em] font-mono mt-2 uppercase">UTC_SYNCED</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="p-6 glass-v-series rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                                <span className="text-[8px] text-white/30 uppercase font-black block mb-2 tracking-widest">Queue Load</span>
                                <span className="text-2xl font-black text-white italic tracking-tighter">24%</span>
                            </div>
                            <div className="p-6 glass-v-series rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center">
                                <span className="text-[8px] text-white/30 uppercase font-black block mb-2 tracking-widest">Efficiency</span>
                                <span className="text-2xl font-black text-hyper-cyan italic tracking-tighter drop-shadow-neon-cyan">OPTIMAL</span>
                            </div>
                        </div>

                        {/* Animated Temporal Core */}
                        <div className="w-full bg-black/60 rounded-[2rem] border border-white/10 p-8 flex flex-col items-center justify-center relative overflow-hidden group/core">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-hyper-cyan/20 overflow-hidden">
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-1/2 h-full bg-hyper-cyan shadow-neon-cyan"
                                />
                            </div>
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-40 h-40 border-2 border-hyper-cyan/10 rounded-full flex items-center justify-center"
                                >
                                    <div className="w-1 h-40 bg-gradient-to-b from-hyper-cyan via-transparent to-hyper-cyan opacity-20 absolute" />
                                    <div className="w-40 h-1 bg-gradient-to-r from-hyper-cyan via-transparent to-hyper-cyan opacity-20 absolute" />
                                </motion.div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={48} className="text-hyper-cyan animate-pulse drop-shadow-neon-cyan" />
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-hyper-cyan uppercase tracking-[0.5em] mt-8 italic">Temporal_Efficiency_Index</span>
                        </div>
                    </div>

                    <div className="flex-1 glass-v-series rounded-[2.5rem] p-10 flex flex-col gap-6 relative overflow-hidden bg-gradient-to-br from-electric-violet/10 to-transparent border border-electric-violet/30 group">
                        <div className="absolute -bottom-8 -right-8 p-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <Shield size={220} className="text-electric-violet" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-electric-violet" />
                            <span className="text-[10px] font-black text-electric-violet uppercase tracking-[0.4em] font-mono">Sovereign_Protection // Roster_AI</span>
                        </div>
                        <h3 className="text-4xl font-black text-white tracking-tighter leading-tight uppercase italic mt-2">Duty Roster AI</h3>
                        <p className="text-sm text-white/60 font-bold leading-relaxed italic max-w-xs">
                            AI coordinator has assigned 4 tactical agents to monitor whale movement alerts during the next 4-hour window.
                        </p>
                        <button className="mt-auto w-full py-5 bg-electric-violet/20 hover:bg-electric-violet text-electric-violet hover:text-carbon-black font-black text-[11px] uppercase tracking-[0.4em] rounded-[1.5rem] transition-all border border-electric-violet/30 italic shadow-neon-violet">
                            Monitor Personnel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
