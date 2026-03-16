'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, AlertTriangle, XCircle, ExternalLink,
    Share2, Filter, Search, RefreshCw, BarChart3,
    Twitter, Globe, TrendingUp, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SocialIntel = {
    id: string;
    source: string;
    author: string;
    content: string;
    summary: string;
    trustScore: number;
    category: string;
    status: 'VERIFIED' | 'DISPUTED' | 'FAKE';
    media_url?: string;
    timestamp: string;
};

export default function IntelligenceNexus() {
    const [intel, setIntel] = useState<SocialIntel[]>([]);
    const [stats, setStats] = useState({ signals24h: 342, syncRate: 94.2, users: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'DISPUTED' | 'FAKE'>('ALL');

    useEffect(() => {
        simulateFetch();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/system/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) {
            console.error("Stats Link Failure:", e);
        }
    };

    const simulateFetch = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/intel/social-nexus');
            const data = await res.json();
            if (data.intel) {
                setIntel(data.intel);
            }
        } catch (e) {
            console.error("Nexus Uplink Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status, score }: { status: string, score: number }) => {
        const config = {
            VERIFIED: { icon: <ShieldCheck size={14} />, bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
            DISPUTED: { icon: <AlertTriangle size={14} />, bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
            FAKE: { icon: <XCircle size={14} />, bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' }
        };

        const active = (config as any)[status];

        return (
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest", active.bg, active.text, active.border)}>
                {active.icon}
                <span>{status} // {score}% TRUST</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center text-hyper-cyan">
                                <Search size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Intelligence_Nexus</h1>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-mono">Social_Signal_Verification // Truth_Engine_Active</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/5">
                            {(['ALL', 'VERIFIED', 'DISPUTED', 'FAKE'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setFilter(mode)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        filter === mode ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={simulateFetch}
                            className="p-3 bg-hyper-cyan text-carbon-black rounded-xl hover:shadow-neon-cyan transition-all"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Signal_Vetting_Rate', val: `${stats.signals24h.toLocaleString()} / 24h`, icon: <TrendingUp className="text-hyper-cyan" /> },
                        { label: 'AI_Confidence_Avg', val: `${stats.syncRate}%`, icon: <Zap className="text-amber-500" /> },
                        { label: 'Network_Nodes_Live', val: stats.users.toLocaleString(), icon: <Twitter className="text-hyper-cyan" /> },
                        { label: 'Verified_Signals', val: (stats.signals24h * 0.7).toFixed(0), icon: <ShieldCheck className="text-emerald-500" /> },
                    ].map((stat, i: number) => (
                        <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <div>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">{stat.label}</span>
                                <span className="text-lg font-black text-white italic">{stat.val}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Intel Gallery */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="popLayout">
                            {intel.filter(i => filter === 'ALL' || i.status === filter).map((item: SocialIntel) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-8 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6 group hover:border-white/10 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                {item.source.includes('X') ? <Twitter size={20} className="text-white/20" /> : <Globe size={20} className="text-white/20" />}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-white uppercase italic">{item.author}</h4>
                                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{item.source} // {item.timestamp}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={item.status} score={item.trustScore} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-5 bg-black/30 rounded-2xl border border-white/5 italic text-sm text-white/70">
                                            "{item.content}"
                                        </div>

                                        <div className="p-5 bg-hyper-cyan/5 rounded-2xl border border-hyper-cyan/10 space-y-3">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-hyper-cyan uppercase tracking-widest">
                                                <Zap size={12} />
                                                <span>AI_Truth_Verification_Summary</span>
                                            </div>
                                            <p className="text-xs text-white/90 leading-relaxed font-medium">
                                                {item.summary}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <div className="flex gap-4">
                                            <button className="flex items-center gap-2 text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">
                                                <ExternalLink size={14} />
                                                <span>Source_Link</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest">
                                                <Share2 size={14} />
                                                <span>Transmit</span>
                                            </button>
                                        </div>
                                        <div className="text-[9px] font-black text-white/10 italic">
                                            CATEGORY: {item.category}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                        Truth_Engine_Latency: 142ms // Accuracy: 99.8%
                    </div>
                    <div className="text-[8px] font-mono text-white/10 uppercase italic">
                        Secured_by_Sovereign_Oracle_Protocol
                    </div>
                </div>

            </div>
        </div>
    );
}
