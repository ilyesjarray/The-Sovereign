'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, CheckSquare, BarChart,
    Bell, Mail, Phone, MapPin, Briefcase,
    ChevronRight, Plus, Search, Star, Zap,
    Activity, Shield, Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function LiaisonCore() {
    const [missions, setMissions] = useState<any[]>([]);
    const [stats, setStats] = useState({ users: 1, signals24h: 342, syncRate: 98.4 });
    const [memos, setMemos] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch missions
                const { data: m } = await supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(3);
                setMissions(m || []);

                // Fetch real memos from scout reports
                const { data: s } = await supabase.from('scout_reports').select('*').order('created_at', { ascending: false }).limit(2);
                setMemos(s || []);
            }

            // Fetch system stats
            const res = await fetch('/api/system/stats');
            const data = await res.json();
            setStats(data);
        };
        fetchData();
    }, []);

    return (
        <div className="flex h-full bg-carbon-black relative overflow-hidden font-sans">
            {/* Neural Sync Grid (Background) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,186,211,0.05)_0%,transparent_70%)]"
                />
            </div>

            {/* Executive Dashboard Section */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Header HUD */}
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01] backdrop-blur-md">
                    <div className="flex items-center gap-10">
                        <div className="relative group">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 border border-hyper-cyan/20 rounded-full opacity-50"
                            />
                            <div className="w-20 h-20 rounded-2xl bg-hyper-cyan/10 flex items-center justify-center border border-hyper-cyan/30 shadow-neon-cyan relative z-10 transition-transform group-hover:scale-110">
                                <Briefcase size={36} className="text-hyper-cyan" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-hyper-cyan font-black tracking-[0.5em] uppercase">/central/ops/protocol_v9</span>
                                <div className="h-[1px] w-12 bg-white/10" />
                                <span className="text-[10px] text-white/20 font-black tracking-widest uppercase italic">Imperial_Secretary_AI</span>
                            </div>
                            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mt-2 leading-none">Liaison Core</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mb-1">Efficiency_Index</span>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-black text-hyper-cyan italic drop-shadow-neon-cyan tracking-tighter">{stats.syncRate}%</span>
                                <Activity size={20} className="text-hyper-cyan animate-pulse" />
                            </div>
                        </div>
                        <button className="h-20 px-12 bg-hyper-cyan text-carbon-black font-black text-[11px] uppercase tracking-[0.5em] rounded-[1.5rem] transition-all shadow-neon-cyan hover:bg-white hover:scale-105 italic flex items-center gap-4">
                            <Plus size={18} />
                            <span>New_Command</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-12">
                        {/* Priority Briefing */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <OpsCard
                                label="ACTIVE_MISSIONS"
                                value={missions.length.toString()}
                                trend={`+${missions.filter(m => m.status === 'ACTIVE').length}_LIVE`}
                                icon={Activity}
                                color="text-hyper-cyan"
                            />
                            <OpsCard
                                label="NODE_URGENCY"
                                value={stats.syncRate > 95 ? "STABLE" : "CAUTION"}
                                trend={`SYNC_${stats.syncRate}%`}
                                icon={Shield}
                                color={stats.syncRate > 95 ? "text-emerald-500" : "text-rose-500"}
                            />
                            <OpsCard
                                label="SYNC_STATUS"
                                value="OPTIMAL"
                                trend={`${stats.signals24h}_SIGNALS`}
                                icon={Cpu}
                                color="text-emerald-500"
                            />
                        </div>

                        {/* Task List */}
                        <div className="glass-v-series rounded-[3rem] border border-white/10 bg-white/[0.01] overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-cyan/30 to-transparent" />
                            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] italic flex items-center gap-4">
                                    <CheckSquare className="text-hyper-cyan" size={20} />
                                    Executive_Duty_Log // Sector_Zero
                                </h4>
                                <div className="flex gap-8">
                                    <button className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase italic tracking-widest">All_Nodes</button>
                                    <button className="text-[10px] font-black text-hyper-cyan uppercase italic tracking-widest underline underline-offset-[8px] decoration-2">Pending_Only</button>
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {missions.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                        className="p-10 flex items-center justify-between group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-hyper-cyan scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
                                        <div className="flex items-center gap-10 relative z-10">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full",
                                                task.status === 'COMPLETED' ? "bg-emerald-500 shadow-neon-emerald" :
                                                    task.priority === 'CRITICAL' ? "bg-rose-500 shadow-neon-rose" : "bg-hyper-cyan"
                                            )} />
                                            <div>
                                                <div className="flex items-center gap-4 mb-1">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">UID: {task.id.toString().slice(0, 8)}</span>
                                                    <div className="h-[1px] w-4 bg-white/5" />
                                                </div>
                                                <div className="text-2xl font-black text-white uppercase italic tracking-tighter transition-colors group-hover:text-hyper-cyan">{task.title}</div>
                                                <div className="flex items-center gap-6 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Zap size={10} className="text-hyper-cyan" />
                                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{task.priority}_PRIORITY</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] font-mono italic">STATUS: {task.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-hyper-cyan group-hover:border-hyper-cyan group-hover:shadow-neon-cyan transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                            <ChevronRight size={24} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Tools (Calendar/Notes) */}
            <div className="w-[450px] border-l border-white/10 bg-white/[0.01] flex flex-col relative z-20 backdrop-blur-xl">
                <div className="p-12 space-y-16">
                    {/* Calendar HUD */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] font-mono italic">Executive_Chronos</span>
                                <span className="text-[8px] text-hyper-cyan uppercase font-black mt-1">Sovereign_Standard_Time</span>
                            </div>
                            <Calendar size={20} className="text-hyper-cyan" />
                        </div>
                        <div className="glass-v-series aspect-square rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 flex flex-col items-center justify-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-hyper-cyan/[0.05] to-transparent opacity-50" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border border-white/5 rounded-full"
                            />
                            <div className="text-center relative z-10">
                                <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] block mb-4">MONTH</span>
                                <span className="text-8xl font-black text-white italic tracking-tighter drop-shadow-neon-cyan leading-none">07</span>
                                <div className="text-sm font-black uppercase tracking-[0.5em] text-hyper-cyan animate-pulse mt-6">MARCH_IMPERIAL_V4</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Intel */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] font-mono italic">Imperial_Memos</span>
                            <div className="h-[1px] flex-1 mx-6 bg-white/5" />
                        </div>
                        <div className="space-y-6">
                            {memos.length === 0 ? (
                                <div className="text-[10px] font-black text-white/10 uppercase tracking-widest text-center py-10">No_Active_Memos</div>
                            ) : memos.map((memo, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-hyper-cyan/40 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                        <Mail size={40} className="text-hyper-cyan" />
                                    </div>
                                    <p className="text-xs text-white/70 font-bold uppercase italic leading-relaxed">
                                        {memo.intel_content?.slice(0, 120)}...
                                    </p>
                                    <div className="flex items-center gap-3 mt-6">
                                        <div className="px-3 py-1 rounded bg-hyper-cyan/10 border border-hyper-cyan/20">
                                            <span className="text-[9px] font-black text-hyper-cyan uppercase tracking-widest">{memo.intel_level || 'PRIORITY_X'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">
                                            <Clock size={12} /> {new Date(memo.created_at).toLocaleTimeString([], { hour12: false })}_SYNC
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bio-Auth Scanner Pulse */}
                    <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                        <div className="w-16 h-1 bg-white/10 rounded-full relative overflow-hidden">
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-hyper-cyan shadow-neon-cyan"
                            />
                        </div>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.8em]">Biometric_Link_Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpsCard({ label, value, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-v-series p-10 rounded-[3rem] border border-white/10 bg-white/[0.01] relative overflow-hidden group hover:border-hyper-cyan/40 transition-all duration-700">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-all duration-700 group-hover:scale-125">
                <Icon size={80} className={color} />
            </div>
            <div className="relative z-10 space-y-6">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] font-mono italic">{label}</span>
                <div className="space-y-1">
                    <div className={cn("text-6xl font-black italic tracking-tighter uppercase leading-none", color, value === 'CRITICAL' ? 'shadow-neon-rose' : 'drop-shadow-neon-cyan')}>
                        {value}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="h-[1px] w-6 bg-white/20" />
                        <span className="text-[10px] font-black text-white/40 tracking-[0.2em] italic uppercase">{trend}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

