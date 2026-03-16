'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Zap,
    Eye,
    Sword,
    Brain,
    Play,
    History,
    AlertCircle,
    Radar,
    RefreshCw,
    Activity,
    Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Agent = {
    id: string;
    name: string;
    role: string;
    icon: any;
    color: string;
    borderColor: string;
    bgColor: string;
};

const AGENTS: Agent[] = [
    {
        id: 'vanguard',
        name: 'Vanguard Alpha',
        role: 'THE_TECHNICIAN',
        icon: Zap,
        color: 'text-hyper-cyan',
        borderColor: 'border-hyper-cyan/30',
        bgColor: 'bg-hyper-cyan/10'
    },
    {
        id: 'oracle',
        name: 'Oracle Primus',
        role: 'THE_STRATEGIST',
        icon: Brain,
        color: 'text-amber-400',
        borderColor: 'border-amber-400/30',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'aegis',
        name: 'Shadow Aegis',
        role: 'THE_SENTINEL',
        icon: Eye,
        color: 'text-rose-400',
        borderColor: 'border-rose-400/30',
        bgColor: 'bg-rose-500/10'
    }
];

export function WarCouncil() {
    const [isDebating, setIsDebating] = useState(false);
    const [debateSteps, setDebateSteps] = useState<any[]>([]);
    const [directive, setDirective] = useState<any>(null);
    const [confidence, setConfidence] = useState(0);

    const startDebate = async () => {
        setIsDebating(true);
        setDebateSteps([]);
        setDirective(null);

        try {
            const res = await fetch('/api/ai/war-council', { method: 'POST' });
            const data = await res.json();

            // Realistic network latency for consensus processing
            if (data.steps && Array.isArray(data.steps)) {
                for (let i = 0; i < data.steps.length; i++) {
                    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
                    setDebateSteps(prev => [...prev, data.steps[i]]);
                }
            }

            setDirective({
                label: data.directive,
                desc: data.directiveDescription
            });
            setConfidence(data.confidence);
        } catch (e) {
            console.error('Council Link Failure', e);
        } finally {
            setIsDebating(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 font-sans overflow-hidden">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10">

                {/* Council Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-neon-amber/20 group cursor-pointer overflow-hidden p-3">
                            <motion.div animate={isDebating ? { rotate: 360 } : {}} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                                <Hexagon className="w-8 h-8 text-amber-500" />
                            </motion.div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">War_Council</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.6em] font-mono mt-1">Multi-Agent_Neural_Consensus_Engine</p>
                        </div>
                    </div>

                    <button
                        onClick={startDebate}
                        disabled={isDebating}
                        className={cn(
                            "group flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all",
                            isDebating
                                ? "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
                                : "bg-amber-500 text-carbon-black hover:bg-amber-400 hover:shadow-neon-amber"
                        )}
                    >
                        {isDebating ? <RefreshCw className="animate-spin" /> : <Play size={20} />}
                        <span>{isDebating ? 'Processing_Consensus' : 'Convene_Council'}</span>
                    </button>
                </div>

                {/* Argument Flow Visualizer (Energy Lines Between Agents) */}
                <div className="relative h-20 -my-10 pointer-events-none z-0">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100">
                        <defs>
                            <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {isDebating && [...Array(3)].map((_, i) => (
                            <motion.path
                                key={i}
                                d={`M ${150 + i * 350} 50 Q 500 ${i % 2 === 0 ? 0 : 100} 500 50`}
                                stroke="url(#flow-grad)"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                            />
                        ))}
                    </svg>
                </div>

                {/* Agents Stage */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {AGENTS.map((agent, i) => (
                        <div
                            key={agent.id || `agent-${i}`}
                            className={cn(
                                "p-8 glass-v-series rounded-[3rem] bg-white/[0.01] border relative overflow-hidden transition-all duration-500",
                                isDebating && debateSteps.some(s => s.agent.toLowerCase().includes(agent.id) || s.agent.toLowerCase().includes(agent.name.split(' ')[0].toLowerCase()))
                                    ? agent.borderColor
                                    : "border-white/5 opacity-40"
                            )}
                        >
                            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl p-4", agent.bgColor)}>
                                <agent.icon size={80} />
                            </div>
                            <agent.icon size={24} className={cn("mb-4", agent.color)} />
                            <h3 className="text-xl font-black text-white italic uppercase tracking-widest">{agent.name}</h3>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">{agent.role}</span>

                            <div className="mt-8 space-y-4">
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: isDebating ? '100%' : '20%' }}
                                        className={cn("h-full", agent.bgColor.split('/')[0])}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                                    <span>Signal_Sync</span>
                                    <span>{isDebating ? 'Uplink_Live' : 'Standby'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Debate Logs */}
                <div className="flex-1 min-h-0 grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 glass-v-series rounded-[3rem] bg-white/[0.01] border border-white/5 p-10 flex flex-col space-y-6 overflow-hidden">
                        <div className="flex items-center gap-4 text-white/40 mb-2">
                            <History size={16} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em]">Consensus_Stream // LIVE</h4>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                            <AnimatePresence mode="popLayout">
                                {debateSteps.length === 0 && !isDebating ? (
                                    <motion.div 
                                        key="empty-state"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-full opacity-10"
                                    >
                                        <Hexagon className="w-24 h-24 mb-6" />
                                        <p className="text-[10px] uppercase font-black tracking-widest text-center italic">Initiate_Neural_Uplink_to_Begin_Strategic_Analysis</p>
                                    </motion.div>
                                ) : null}
                                {debateSteps.map((step, i) => {
                                    const agent = AGENTS.find(a => step.agent.toLowerCase().includes(a.id) || step.agent.toLowerCase().includes(a.name.split(' ')[0].toLowerCase())) || AGENTS[0];
                                    return (
                                        <motion.div
                                            key={`${step.agent}-${i}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-6"
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center shrink-0", agent.borderColor, agent.bgColor)}>
                                                <agent.icon size={16} className={agent.color} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn("text-[10px] font-black uppercase italic tracking-widest", agent.color)}>{step.agent}</span>
                                                    <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Decision_Node_{i + 1}</span>
                                                </div>
                                                <p className="text-sm font-bold text-white/70 leading-relaxed italic">{step.content}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                {isDebating ? (
                                    <motion.div 
                                        key="loading-skeleton"
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="flex gap-6"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
                                        <div className="space-y-2 flex-1">
                                            <div className="w-32 h-2 bg-white/5 rounded-full animate-pulse" />
                                            <div className="w-full h-3 bg-white/5 rounded-full animate-pulse" />
                                            <div className="w-3/4 h-3 bg-white/5 rounded-full animate-pulse" />
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Imperial Directive */}
                    <div className="glass-v-series rounded-[3rem] bg-white/[0.01] border border-white/10 p-10 flex flex-col space-y-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-amber-500/[0.02] group-hover:bg-amber-500/[0.04] transition-all" />

                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <Sword className="text-amber-500/20 group-hover:text-amber-500 transition-colors" size={48} />
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Imperial_Directive</h4>

                            <AnimatePresence mode="wait">
                                {directive ? (
                                    <motion.div
                                        key="directive"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-3xl font-black text-amber-500 italic tracking-tighter uppercase shadow-neon-amber/20 drop-shadow-md">
                                            {directive.label}
                                        </h2>
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                                            {directive.desc}
                                        </p>
                                        <div className="pt-8 space-y-2">
                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Neural_Confidence</div>
                                            <div className="text-4xl font-black text-white italic tracking-tighter">{confidence}%</div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="awaiting-directive"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Awaiting_Decision</h2>
                                        <p className="text-[10px] uppercase font-black text-white/40">Consensus_Pending_Convergence</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 text-[9px] font-black text-white/20 uppercase">
                                <AlertCircle size={14} className="text-amber-500/40" />
                                <span>Directive_Authorized_By_Council</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
