'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Zap, AlertTriangle, ShieldCheck,
    TrendingUp, TrendingDown, Info, Search,
    Activity, GitBranch, ArrowUpRight, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { temporalService, TemporalBranch } from '@/lib/services/temporal-service';
import { ReportGenerator } from '@/lib/services/report-generator';

export default function TemporalEngine() {
    const [query, setQuery] = useState('');
    const [branches, setBranches] = useState<TemporalBranch[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<TemporalBranch | null>(null);
    const [stats, setStats] = useState({ syncRate: 98.4, users: 1 });

    useEffect(() => {
        fetch('/api/system/stats').then(res => res.json()).then(data => {
            if (data.users) setStats(data);
        });
    }, []);

    const runSimulation = async () => {
        if (!query.trim()) return;
        setIsSimulating(true);
        setBranches([]);
        try {
            const res = await fetch('/api/temporal/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            if (data.branches) {
                setBranches(data.branches);
            }
        } catch (e) {
            console.error("Temporal Link Failure:", e);
        } finally {
            setIsSimulating(false);
        }
    };

    const StatusIcon = ({ name }: { name: string }) => {
        switch (name) {
            case 'ANCHOR': return <ShieldCheck className="text-hyper-cyan" />;
            case 'CHAOS': return <Activity className="text-amber-500" />;
            case 'COLLAPSE': return <AlertTriangle className="text-rose-500" />;
            case 'SINGULARITY': return <Zap className="text-emerald-500" />;
            case 'BLACK_SWAN': return <Brain className="text-electric-violet" />;
            default: return <Info />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden relative">

            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8 relative z-10">

                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center text-hyper-cyan animate-pulse">
                                <Clock size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Chronos_Singularity</h1>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-mono">Predictive_Temporal_Branching // Zero_Latency_Logic</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-[9px] text-white/40 uppercase tracking-widest">
                            <Activity size={12} className="text-hyper-cyan" />
                            <span>Oracle_Status: SYNCHRONIZED</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-hyper-cyan/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-4 bg-white/[0.02] border border-white/10 rounded-[2rem] px-8 py-5 focus-within:border-hyper-cyan/40 transition-all">
                            <Search size={18} className="text-white/20" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
                                placeholder="ENTER_EVENT_TO_SIMULATE (e.g. 'Bitcoin Spot ETF Approval in Saudi Arabia')"
                                className="flex-1 bg-transparent border-none outline-none text-xs font-black text-white placeholder:text-white/10 uppercase italic tracking-wider"
                            />
                        </div>
                    </div>
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating || !query.trim()}
                        className={cn(
                            "px-10 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3",
                            isSimulating ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-hyper-cyan text-carbon-black hover:shadow-neon-cyan"
                        )}
                    >
                        {isSimulating ? 'Simulating_Branching...' : 'Initialize_Sim'}
                        <Zap size={14} className={isSimulating ? "animate-pulse" : ""} />
                    </button>
                </div>

                {/* Main Engine Visualization */}
                <div className="flex-1 grid lg:grid-cols-2 gap-10 overflow-hidden">

                    {/* Left: Branching Visualization */}
                    <div className="relative bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-center overflow-hidden">

                        {/* Recursive Visual Lines */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <svg className="w-full h-full">
                                <motion.path
                                    d="M 50,250 Q 250,250 450,250"
                                    className="stroke-white/5 stroke-2" fill="none"
                                />
                                {branches.length > 0 && branches.map((_, i) => (
                                    <motion.path
                                        key={i}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1.5, delay: i * 0.2 }}
                                        d={`M 50,250 Q 150,250 250,250 T 450,${100 + i * 75}`}
                                        className={cn(
                                            "stroke-2 fill-none",
                                            selectedBranch?.id === branches[i].id ? "stroke-hyper-cyan" : "stroke-white/10"
                                        )}
                                    />
                                ))}
                            </svg>
                        </div>

                        <div className="relative space-y-8">
                            <AnimatePresence>
                                {branches.length === 0 && !isSimulating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center space-y-4 opacity-10"
                                    >
                                        <GitBranch size={80} className="mx-auto" />
                                        <p className="text-xs font-black uppercase tracking-[0.5em]">Input_Required // Temporal_Engine_Idle</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid gap-4">
                                {branches.map((branch, i) => (
                                    <motion.button
                                        key={branch.id}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedBranch(branch)}
                                        className={cn(
                                            "w-full p-6 border rounded-[1.5rem] flex items-center justify-between group transition-all",
                                            selectedBranch?.id === branch.id
                                                ? "bg-hyper-cyan/10 border-hyper-cyan/40 scale-105"
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <StatusIcon name={branch.name} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-[10px] font-black text-white italic tracking-widest uppercase">{branch.name}</h4>
                                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{branch.horizon} Horizon</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-white italic">{branch.probability}%</div>
                                            <div className="text-[7px] text-white/20 uppercase font-mono tracking-widest">Probability</div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Synthesis Detail */}
                    <div className="flex flex-col space-y-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {selectedBranch ? (
                                <motion.div
                                    key={selectedBranch.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex-1 flex flex-col space-y-6 overflow-hidden"
                                >
                                    {/* Intelligence Synthesis */}
                                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6">
                                        <div className="flex items-center gap-3 text-[9px] font-black text-hyper-cyan uppercase tracking-[0.4em]">
                                            <Zap size={14} />
                                            <span>Timeline_Synthesis_Brief</span>
                                        </div>
                                        <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                                            "{selectedBranch.description}"
                                        </p>
                                    </div>

                                    {/* Portfolio Projected Impact */}
                                    <div className="p-10 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[3rem] space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Activity size={100} className={selectedBranch.impact_factor > 0 ? "text-emerald-500" : "text-rose-500"} />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Projected_Net_Impact</span>
                                            <div className="mt-2 flex items-baseline gap-4">
                                                <h2 className={cn(
                                                    "text-5xl font-black italic tracking-tighter",
                                                    selectedBranch.impact_factor > 0 ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {(selectedBranch.impact_factor * 100).toFixed(1)}%
                                                </h2>
                                                {selectedBranch.impact_factor > 0 ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/40 tracking-widest">
                                                <span>Adaptive_Survival_Strategy</span>
                                                <ShieldCheck size={14} className="text-hyper-cyan" />
                                            </div>
                                            <div className="p-5 bg-black/40 rounded-2xl border border-white/5 text-[11px] font-mono text-hyper-cyan/80 leading-relaxed">
                                                INITIALIZE {selectedBranch.impact_factor > 0 ? 'HYPER_GROWTH' : 'DEFENSIVE_HEDGING'} PROTOCOLS.
                                                ALLOCATION SHIFT: {selectedBranch.impact_factor > 0 ? `+${(Math.random() * 5 + 10).toFixed(1)}%` : `-${(Math.random() * 8 + 15).toFixed(1)}%`} RISK_EXPOSURE.
                                                SURVIVAL CONFIDENCE: {stats.syncRate}%
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => ReportGenerator.generateIntelligenceBrief({ description: selectedBranch.description, timelines: branches }, 'TEMPORAL_BRANCHING')}
                                        className="w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <span>Download_Temporal_Strategy_Briefer</span>
                                        <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10 space-y-6 p-10 bg-white/[0.01] border border-white/5 rounded-[3rem]">
                                    <Brain size={120} />
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-[0.5em]">Neural_Simulation_Standby</h3>
                                        <p className="text-[9px] font-mono uppercase">Select a branch to analyze projected causality.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                        Causality_Sync: ACTIVE // Confidence: {stats.syncRate > 99 ? '99.9%' : stats.syncRate + '%'}
                    </div>
                    <div className="text-[8px] font-mono text-white/10 uppercase italic">
                        Temporal_Calculation_Nodes: ONLINE
                    </div>
                </div>

            </div>
        </div>
    );
}
