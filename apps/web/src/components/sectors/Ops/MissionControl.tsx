'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Zap,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Rocket,
    Trophy,
    ChevronRight,
    User,
    Activity,
    Globe
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Mission = {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    credits_reward: number;
    due_date: string | null;
};

export function MissionControl() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);
    const [telemetry, setTelemetry] = useState<string[]>([]);
    const [systemStats, setSystemStats] = useState({ users: 1, signals24h: 342 });
    const [profile, setProfile] = useState<any>(null);

    // New Mission Form
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
    const [reward, setReward] = useState(100);

    const supabase = createClient();

    useEffect(() => {
        fetchMissions();
        fetchSystemStats();
        fetchProfile();

        const interval = setInterval(async () => {
            const stats = await fetchSystemStats();
            const updates = [
                `NETWORK: ${stats.users} Sovereigns currently synced`,
                `INTEL: ${stats.signals24h} signals verified in last 24h`,
                "SECURED: Imperial_Vault integrity 100%",
                "PROTOCOL: Neural_Link stable at 12ms",
                `STATUS: System operating at optimal capacity`
            ];
            setTelemetry(prev => [updates[Math.floor(Math.random() * updates.length)], ...prev].slice(0, 4));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const fetchSystemStats = async () => {
        try {
            const res = await fetch('/api/system/stats');
            const data = await res.json();
            setSystemStats(data);
            return data;
        } catch (e) {
            return { users: 1, signals24h: 0 };
        }
    };

    const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            setProfile(data);
        }
    };

    const fetchMissions = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase
                .from('missions')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setMissions(data || []);
        }
        setLoading(false);
    };

    const deployMission = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase.from('missions').insert({
            user_id: session.user.id,
            title,
            priority,
            credits_reward: reward,
            status: 'ACTIVE'
        });

        if (!error) {
            setTitle('');
            setIsDeploying(false);
            fetchMissions();
        }
    };

    const completeMission = async (id: string) => {
        // Call our RPC function for atomic update
        const { error } = await supabase.rpc('complete_mission', { p_mission_id: id });
        if (!error) fetchMissions();
    };

    const stats = {
        total: missions?.length || 0,
        completed: (missions || []).filter(m => m?.status === 'COMPLETED').length,
        credits: (missions || []).filter(m => m?.status === 'COMPLETED').reduce((acc, m) => acc + (m?.credits_reward || 0), 0)
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans relative">
            {/* Tactical Grid (Background) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,186,211,0.2)_0%,transparent_70%)]" />
                <svg className="w-full h-full">
                    <defs>
                        <pattern id="tactical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="1.5" fill="white" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tactical-grid)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-10 relative z-10">

                {/* Imperial Header */}
                <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <Target size={200} />
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -inset-4 bg-hyper-cyan rounded-full filter blur-2xl"
                            />
                            <div className="w-24 h-24 rounded-[1.5rem] bg-carbon-black border border-hyper-cyan/40 flex items-center justify-center shadow-neon-cyan relative z-10">
                                <Target className="w-12 h-12 text-hyper-cyan animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-hyper-cyan font-black tracking-[0.5em] uppercase">Sector: Zero-Prime</span>
                                <div className="h-[1px] w-12 bg-white/10" />
                                <span className="text-[10px] text-white/20 font-black tracking-widest uppercase italic">Orbital_Station_V4</span>
                            </div>
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mt-2 leading-none">Mission Control</h1>
                        </div>
                    </div>

                    <div className="flex gap-12">
                        <div className="text-right">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">Accumulated_Credits</span>
                            <div className="flex items-center justify-end gap-3">
                                <span className="text-5xl font-black text-hyper-cyan italic tracking-tighter drop-shadow-neon-cyan leading-none">{stats.credits.toLocaleString()}</span>
                                <Zap size={24} className="text-hyper-cyan" />
                            </div>
                        </div>
                        <div className="w-[1px] h-16 bg-white/10" />
                        <div className="text-right">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">Success_Rate</span>
                            <div className="flex items-center justify-end gap-3 leading-none">
                                <span className="text-5xl font-black text-white italic tracking-tighter">
                                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                </span>
                                <Activity size={24} className="text-white/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-6">
                    <button
                        onClick={() => setIsDeploying(true)}
                        className="group flex items-center gap-6 px-12 py-7 bg-hyper-cyan text-carbon-black rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-neon-cyan hover:bg-white transition-all italic"
                    >
                        <Plus size={24} />
                        Initialize_New_Mission
                    </button>

                    {/* Live Telemetry Feed */}
                    <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-[1.5rem] px-10 py-5 flex items-center gap-10 overflow-hidden backdrop-blur-md">
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-hyper-cyan animate-pulse shadow-neon-cyan" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap italic">Live_Field_Telemetry:</span>
                        </div>
                        <div className="flex-1 flex gap-12 items-center">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {telemetry.length > 0 ? telemetry.map((msg, i) => (
                                    <motion.span
                                        key={`telemetry-${msg.slice(0, 15)}-${i}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="text-[10px] font-mono text-hyper-cyan/60 uppercase tracking-widest whitespace-nowrap border-r border-white/5 pr-12 last:border-0 italic"
                                    >
                                        <span className="text-hyper-cyan/40">[{new Date().toLocaleTimeString([], { hour12: false })}]</span> {msg}
                                    </motion.span>
                                )) : (
                                    <motion.span 
                                        key="telemetry-init" 
                                        className="text-[10px] font-mono text-white/5 uppercase tracking-widest italic"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        UPLINK_ESTABLISHED...
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 border-l border-white/5 pl-10">
                            <Globe size={18} className="text-hyper-cyan animate-spin-slow" />
                            <div>
                                <div className="text-[8px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Active_Nodes</div>
                                <div className="text-[11px] text-white font-black tracking-widest leading-none">{systemStats.users}_LOCKED</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Matrix */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 pb-12">
                    <AnimatePresence mode="popLayout">
                            {isDeploying ? (
                                <motion.div
                                    key="mission-deploy-form"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    className="mb-12 p-12 glass-v-series border border-hyper-cyan/30 rounded-[3.5rem] bg-hyper-cyan/[0.03] relative overflow-hidden"
                                >
                                <div className="absolute top-0 right-0 p-12 opacity-5">
                                    <Rocket size={180} className="text-hyper-cyan" />
                                </div>

                                <form onSubmit={deployMission} className="relative z-10 space-y-12">
                                    <div className="grid lg:grid-cols-2 gap-16">
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-hyper-cyan uppercase tracking-[0.5em] ml-1 flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-hyper-cyan" />
                                                Mission_Title_Protocol
                                            </label>
                                            <input
                                                required
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="ENTER_OBJECTIVE_NAME..."
                                                className="w-full bg-black/60 border border-white/10 rounded-[1.25rem] py-7 px-8 text-lg font-black text-white outline-none focus:border-hyper-cyan/60 transition-all placeholder:text-white/10 italic tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <label className="text-[11px] font-black text-hyper-cyan uppercase tracking-[0.5em] ml-1 flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                                Threat_Level_Priority
                                            </label>
                                            <div className="grid grid-cols-4 gap-4">
                                                {['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPriority(p as any)}
                                                        className={cn(
                                                            "py-7 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.3em] border transition-all italic",
                                                            priority === p
                                                                ? "bg-hyper-cyan text-carbon-black border-hyper-cyan shadow-neon-cyan"
                                                                : "bg-white/[0.02] border-white/10 text-white/30 hover:border-white/30"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <div className="flex items-center gap-12">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Bounty_Credits_Allocation</label>
                                                <div className="flex items-center gap-8">
                                                    <input
                                                        type="range" min="50" max="1000" step="50"
                                                        value={reward}
                                                        onChange={(e) => setReward(parseInt(e.target.value))}
                                                        className="w-64 h-2 bg-white/5 rounded-full appearance-none accent-hyper-cyan cursor-pointer"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-4xl font-black text-hyper-cyan italic tracking-tighter">{reward}</span>
                                                        <Zap size={20} className="text-hyper-cyan" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-8">
                                            <button
                                                type="button"
                                                onClick={() => setIsDeploying(false)}
                                                className="px-10 py-5 text-[11px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors italic"
                                            >
                                                Abort_Deployment
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-16 py-5 bg-white text-carbon-black rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.5em] hover:bg-hyper-cyan transition-all italic shadow-neon-cyan"
                                            >
                                                Initialize_Deployment
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        ) : null}

                            <motion.div 
                                key="missions-list-container" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid gap-6"
                            >
                                {missions.map((mission, i) => (
                                    <motion.div
                                        key={mission.id || `mission-${i}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "group flex items-center gap-10 p-8 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden",
                                        mission.status === 'COMPLETED'
                                            ? "bg-emerald-500/[0.02] border-emerald-500/20 grayscale-[0.8] opacity-60"
                                            : "bg-white/[0.01] border-white/10 hover:border-hyper-cyan/30 hover:bg-white/[0.03]"
                                    )}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none">
                                        <Target size={120} />
                                    </div>

                                    <div className={cn(
                                        "w-20 h-20 rounded-[1.25rem] flex items-center justify-center shrink-0 border transition-all duration-500",
                                        mission.status === 'COMPLETED'
                                            ? "bg-hyper-cyan/20 border-hyper-cyan/40 text-hyper-cyan shadow-neon-cyan/20"
                                            : "bg-white/5 border-white/10 text-white/20 group-hover:border-hyper-cyan/40 group-hover:text-hyper-cyan group-hover:shadow-neon-cyan/20"
                                    )}>
                                        {mission.status === 'COMPLETED' ? <CheckCircle2 size={36} /> : <Target size={36} />}
                                    </div>

                                    <div className="flex-1 space-y-2 overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter truncate italic group-hover:text-hyper-cyan transition-colors">
                                                {mission.title}
                                            </h3>
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] font-mono border italic",
                                                mission.priority === 'CRITICAL' ? "bg-blue-600/10 text-blue-400 border-blue-600/20" : "bg-white/5 text-white/40 border-white/10"
                                            )}>
                                                {mission.priority}_LVL
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
                                            <div className="flex items-center gap-3">
                                                <Clock size={14} className="text-hyper-cyan/40" />
                                                <span>Active_Session: <span className="text-white/40">PRIMO_SYNC</span></span>
                                            </div>
                                            <div className="w-[1px] h-3 bg-white/5" />
                                            <div className="flex items-center gap-3">
                                                <User size={14} className="text-hyper-cyan/40" />
                                                <span>Operator: <span className="text-white/40">{profile?.username || 'SYSTEM_PRIME'}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right px-10 shrink-0 border-x border-white/5">
                                        <span className="text-[10px] font-black text-white/30 uppercase block tracking-[0.4em] mb-1 italic">Bounty_Extraction</span>
                                        <div className="flex items-center justify-end gap-3 text-hyper-cyan">
                                            <span className="text-4xl font-black italic tracking-tighter drop-shadow-neon-cyan">+{mission.credits_reward}</span>
                                            <Zap size={20} className="animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="shrink-0 pl-10 min-w-[240px]">
                                        {mission.status !== 'COMPLETED' && (
                                            <button
                                                onClick={() => completeMission(mission.id)}
                                                className="w-full py-5 bg-white/[0.03] hover:bg-hyper-cyan hover:text-carbon-black border border-white/10 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 group/btn italic shadow-neon-cyan/10 hover:shadow-neon-cyan"
                                            >
                                                Extraction_Ready
                                                <ChevronRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                            </button>
                                        )}
                                        {mission.status === 'COMPLETED' && (
                                            <div className="flex items-center justify-center gap-4 text-emerald-500 font-black text-[11px] uppercase tracking-[0.5em] italic">
                                                <div className="w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center">
                                                    <Trophy size={20} />
                                                </div>
                                                Secured_In_Ledger
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {missions.length === 0 && !loading && !isDeploying ? (
                            <motion.div 
                                key="mission-empty-state-container" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-56 border border-dashed border-white/10 rounded-[4rem] group hover:border-hyper-cyan/40 transition-colors"
                            >
                                <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 group-hover:border-hyper-cyan/20 transition-all">
                                    <Target className="w-16 h-16 text-white/10 group-hover:text-hyper-cyan/20 transition-colors" />
                                </div>
                                <p className="text-[14px] font-black text-white/20 uppercase tracking-[1em] italic">No_Active_Missions</p>
                                <button
                                    onClick={() => setIsDeploying(true)}
                                    className="mt-10 px-12 py-5 bg-hyper-cyan/5 border border-hyper-cyan/20 rounded-2xl text-hyper-cyan text-[11px] font-black uppercase tracking-[0.5em] hover:bg-hyper-cyan hover:text-carbon-black transition-all italic shadow-neon-cyan/20"
                                >
                                    Initiate_Command_Sequence
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Global Alert System */}
                <div className="flex items-center gap-8 bg-blue-600/5 border border-blue-600/20 p-8 rounded-[2rem] backdrop-blur-xl group hover:bg-blue-600/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shadow-neon-blue">
                        <AlertTriangle className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] italic">Imperial_Warning_System</span>
                            <div className="h-[1px] w-24 bg-blue-600/20" />
                        </div>
                        <p className="text-[11px] text-blue-500/60 font-black uppercase tracking-[0.3em] leading-relaxed italic">
                            Objective failed state results in <span className="text-blue-500 underline underline-offset-4 decoration-2">25% credit decay</span>.
                            Maintain operational integrity for maximum bounty extraction.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
