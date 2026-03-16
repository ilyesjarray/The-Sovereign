'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Zap,
    ChevronLeft,
    ChevronRight,
    Activity,
    Target,
    Coffee,
    Brain
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type ChronosEvent = {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    category: string;
};

export function Chronos() {
    const [events, setEvents] = useState<ChronosEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [rawTasks, setRawTasks] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchEvents();
    }, [selectedDay]);

    const fetchEvents = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase
                .from('chronos_events')
                .select('*')
                .order('start_time', { ascending: true });
            if (data) setEvents(data);
        }
        setLoading(false);
    };

    const optimizeDay = async () => {
        if (!rawTasks.trim()) return;
        setIsOptimizing(true);
        try {
            const res = await fetch('/api/intel/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: rawTasks, date: selectedDay.toISOString().split('T')[0] })
            });
            const data = await res.json();

            if (data.schedule) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Add user_id to events
                    const newEvents = data.schedule.map((e: any) => ({ ...e, user_id: session.user.id }));
                    await supabase.from('chronos_events').insert(newEvents);
                    setRawTasks('');
                    fetchEvents();
                }
            }
        } catch (e) {
            console.error('Temporal error:', e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const categories = {
        'OPERATION': { icon: <Activity size={14} />, color: 'text-hyper-cyan', bg: 'bg-hyper-cyan/10' },
        'MISSION': { icon: <Target size={14} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        'REST': { icon: <Coffee size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        'STRATEGIC': { icon: <Brain size={14} />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10">

                {/* Chronos Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-neon-emerald/20">
                            <CalendarIcon className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Chronos_Engine</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-1">AI_Temporal_Governance // Quantum_Scheduling</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/20 hover:text-white transition-all"><ChevronLeft size={20} /></button>
                            <div className="px-8 py-4 bg-white/[0.02] border border-white/10 rounded-xl flex flex-col items-center min-w-[120px]">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedDay.toLocaleDateString('en-US', { month: 'long' })}</span>
                                <span className="text-xl font-black text-emerald-500 italic tracking-tighter">{selectedDay.getDate()}</span>
                            </div>
                            <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/20 hover:text-white transition-all"><ChevronRight size={20} /></button>
                        </div>
                        <button className="group flex items-center gap-4 px-10 py-5 bg-emerald-500 text-carbon-black rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-neon-emerald transition-all">
                            <Plus size={20} />
                            <span>Initialize_Slot</span>
                        </button>
                    </div>
                </div>

                {/* Temporal Matrix */}
                <div className="grid lg:grid-cols-3 gap-10 flex-1 overflow-hidden">

                    {/* Timeline View */}
                    <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="space-y-8">
                            {[8, 10, 12, 14, 16, 18, 20].map((hour) => (
                                <div key={hour} className="relative pl-20">
                                    <span className="absolute left-0 top-[-8px] text-[10px] font-mono text-white/10">{hour}:00_HRS</span>
                                    <div className="h-px bg-white/5 w-full mt-1.5" />

                                    <div className="mt-4 space-y-4">
                                        {events.filter(e => new Date(e.start_time).getHours() === hour).map(ex => (
                                            <motion.div
                                                key={ex.id}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className={cn(
                                                    "p-6 rounded-3xl border flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all",
                                                    (categories as any)[ex.category]?.bg || "bg-white/5",
                                                    (categories as any)[ex.category]?.color.replace('text-', 'border-').replace('text-', 'border-') || "border-white/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 rounded-lg", (categories as any)[ex.category]?.color)}>
                                                        {(categories as any)[ex.category]?.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">{ex.title}</h4>
                                                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                                                            {new Date(ex.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ex.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Zap size={14} className="text-white/20" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Advisor Column */}
                    <div className="space-y-8 flex flex-col">
                        {/* AI Optimization Card */}
                        <div className="p-8 bg-emerald-500 text-carbon-black rounded-[3rem] space-y-4 relative overflow-hidden flex flex-col">
                            <Zap size={150} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                            <div className="flex items-center gap-3">
                                <Brain size={24} className="animate-pulse" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em]">AI_Auto_Scheduler</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                Dump your chaotic tasks here. Chronos will organize them.
                            </p>
                            <textarea
                                value={rawTasks}
                                onChange={(e) => setRawTasks(e.target.value)}
                                placeholder="E.g., meeting with John, workout, design review, clear emails..."
                                className="w-full bg-carbon-black/10 border border-carbon-black/20 text-carbon-black placeholder-carbon-black/40 rounded-2xl p-4 font-mono text-xs custom-scrollbar resize-none focus:outline-none focus:ring-2 focus:ring-carbon-black/50 transition-all h-24"
                            />
                            <button
                                onClick={optimizeDay}
                                disabled={isOptimizing}
                                className={cn(
                                    "w-full py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                                    isOptimizing ? "bg-carbon-black/50 cursor-not-allowed" : "bg-carbon-black hover:bg-carbon-black/80"
                                )}>
                                {isOptimizing ? 'Synthesizing_Timeline...' : 'Optimize_Full_Day'}
                            </button>
                        </div>

                        {/* Distribution Chart Placeholder */}
                        <div className="flex-1 glass-v-series border border-white/5 rounded-[3rem] bg-white/[0.01] p-8 flex flex-col space-y-6">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Temporal_Allocation</span>
                            <div className="flex-1 flex flex-col justify-end space-y-4">
                                {[
                                    { l: 'OPS', p: 40, c: 'bg-hyper-cyan' },
                                    { l: 'MSN', p: 30, c: 'bg-amber-500' },
                                    { l: 'RST', p: 20, c: 'bg-emerald-500' },
                                    { l: 'STR', p: 10, c: 'bg-indigo-400' }
                                ].map(item => (
                                    <div key={item.l} className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase text-white/40 tracking-tighter">
                                            <span>{item.l}</span>
                                            <span>{item.p}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.p}%` }}
                                                className={cn("h-full shadow-lg", item.c)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                        Chronos_Node: SYNCED // Drift: 0.0001s
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-white/10 uppercase italic">
                        Quantum_Temporal_Guard: ENGAGED
                    </div>
                </div>

            </div>
        </div>
    );
}
