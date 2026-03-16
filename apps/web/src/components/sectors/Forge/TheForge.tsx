'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cpu,
    Plus,
    Zap,
    Shield,
    Activity,
    Settings2,
    Play,
    Pause,
    Trash2,
    Terminal,
    Code2,
    BrainCircuit,
    Binary,
    ShieldCheck,
    Waves,
    Dna
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type AIAgent = {
    id: string;
    name: string;
    description: string;
    trigger_protocol: string;
    status: 'ACTIVE' | 'INACTIVE' | 'RUNNING';
    last_run: string | null;
    config: any;
};

export function TheForge() {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Agent State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [protocol, setProtocol] = useState('SCHEDULED');
    const [forgeLogs, setForgeLogs] = useState<string[]>([]);

    const supabase = createClient();

    useEffect(() => {
        fetchAgents();
        const interval = setInterval(() => {
            const logs = [
                "NEURAL_SYNAPSE_CALIBRATED",
                "BITSTREAM_VALIDATED",
                "CORE_TEMP_STABLE",
                "QUANTUM_ENTANGLEMENT_ACTIVE",
                "LOGIC_GATES_ENCRYPTED",
                "HEURISTIC_BUFFER_SYNCED"
            ];
            setForgeLogs(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev].slice(0, 5));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchAgents = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase
                .from('ai_agents')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setAgents(data || []);
        }
        setLoading(false);
    };

    const createAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase.from('ai_agents').insert({
            user_id: session.user.id,
            name,
            description: desc,
            trigger_protocol: protocol,
            status: 'INACTIVE'
        });

        if (!error) {
            setName('');
            setDesc('');
            setIsCreating(false);
            fetchAgents();
        }
    };

    const toggleAgent = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await supabase.from('ai_agents').update({ status: newStatus }).eq('id', id);
        fetchAgents();
    };

    const deleteAgent = async (id: string) => {
        await supabase.from('ai_agents').delete().eq('id', id);
        fetchAgents();
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10">

                {/* Forge Protocol Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-neon-amber">
                                <BrainCircuit className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">The_Forge</h1>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-1">Autonomous_Agent_Production_Facility</p>
                            </div>
                        </div>
                    </div>

                    {/* Genetic DNA Blueprint Visualizer */}
                    <div className="hidden lg:flex items-center gap-6 px-8 border-x border-white/5">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <Dna size={24} className="text-amber-500 animate-spin-slow" />
                            <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute inset-0 bg-amber-500 rounded-full blur-xl"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Genetic_Blueprint</span>
                            <div className="flex gap-1 mt-1">
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [4, 12, 4] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                        className="w-1 bg-amber-500/40 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="group flex items-center gap-4 px-10 py-5 bg-amber-500 text-carbon-black rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-neon-amber transition-all"
                    >
                        <Plus size={20} />
                        Initialize_New_Agent
                    </button>
                </div>

                {/* Matrix Controls */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
                    <AnimatePresence mode="popLayout">
                        {isCreating && (
                            <motion.div
                                key="forge-agent-creator"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="mb-10 p-10 glass-v-series border border-amber-500/20 rounded-[3rem] bg-amber-500/[0.02] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-10 opacity-5">
                                    <Binary size={150} className="text-amber-500" />
                                </div>

                                <form onSubmit={createAgent} className="relative z-10 space-y-10">
                                    <div className="grid lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Agent_Identity_Protocol</label>
                                                <input
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="AGENT_DESIGNATION..."
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/40"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Assigned_Directive</label>
                                                <textarea
                                                    required
                                                    value={desc}
                                                    onChange={(e) => setDesc(e.target.value)}
                                                    placeholder="DESCRIBE_THE_TASK_IN_NATURAL_LANGUAGE..."
                                                    rows={3}
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-6 text-sm font-bold text-white outline-none focus:border-amber-500/40 resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Trigger_Matrix_Protocol</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['SCHEDULED', 'MARKET_EVENT', 'SYSTEM_TRAFFIC', 'MANUAL'].map((p, i) => (
                                                        <button
                                                            key={`${p}-${i}`}
                                                            type="button"
                                                            onClick={() => setProtocol(p)}
                                                            className={cn(
                                                                "py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                                                protocol === p
                                                                    ? "bg-amber-500 text-carbon-black border-amber-500 shadow-neon-amber/20"
                                                                    : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                                                            )}
                                                        >
                                                            {p.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl">
                                                <Settings2 size={24} className="text-amber-500 shrink-0" />
                                                <p className="text-[9px] text-amber-500/60 font-black uppercase tracking-widest leading-relaxed">
                                                    Note: Agent deployment consumes 5 Sovereign Credits per major execution cycle.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-6 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                        >
                                            Abort_Creation
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-12 py-5 bg-white text-carbon-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-amber-500 transition-all"
                                        >
                                            Establish_Agent
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div key="forge-agents-grid" className="grid md:grid-cols-2 gap-8">
                            {agents.map((agent, i) => (
                                <motion.div
                                    layout
                                    key={agent.id || `agent-${i}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "group relative p-10 rounded-[3rem] border transition-all duration-500",
                                        agent.status === 'ACTIVE'
                                            ? "bg-amber-500/[0.02] border-amber-500/20 shadow-lg"
                                            : "bg-white/[0.01] border-white/5 hover:border-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all",
                                                agent.status === 'ACTIVE' ? "bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-neon-amber/20" : "bg-white/5 border-white/10 text-white/20"
                                            )}>
                                                <Cpu size={32} className={agent.status === 'ACTIVE' ? "animate-pulse" : ""} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white uppercase tracking-tighter italic group-hover:text-amber-500 transition-colors">
                                                    {agent.name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{agent.trigger_protocol}</span>
                                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest",
                                                        agent.status === 'ACTIVE' ? "text-emerald-500" : "text-rose-500"
                                                    )}>{agent.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleAgent(agent.id, agent.status)}
                                                className={cn(
                                                    "p-4 rounded-xl transition-all",
                                                    agent.status === 'ACTIVE' ? "bg-amber-500 text-carbon-black" : "bg-white/5 text-white/20 hover:text-white"
                                                )}
                                            >
                                                {agent.status === 'ACTIVE' ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                            <button
                                                onClick={() => deleteAgent(agent.id)}
                                                className="p-4 bg-white/5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs font-bold text-white/40 leading-relaxed uppercase tracking-wide mb-8">
                                        {agent.description}
                                    </p>

                                    <div className="space-y-4">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: agent.status === 'ACTIVE' ? '100%' : '0%' }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-full bg-amber-500/40"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-white/20">
                                            <span>Neural_Load: 14%</span>
                                            <span>Last_Scan: {agent.last_run ? new Date(agent.last_run).toLocaleTimeString() : 'NEVER'}</span>
                                        </div>
                                    </div>

                                    {/* Terminal Peek */}
                                    <div className="mt-8 p-6 bg-black/60 rounded-2xl border border-white/5 font-mono text-[9px] text-amber-500/40">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Terminal size={10} />
                                            <span>AGENT_STDOUT</span>
                                        </div>
                                        <p className="tracking-tighter">
                                            {agent.status === 'ACTIVE' ? '> [SYSTEM]: MONITORING_FREQUENCIES_SUCCESSFUL...' : '> [SYSTEM]: AGENT_STANDBY_MODE_ENGAGED'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {agents.length === 0 && !loading && !isCreating ? (
                            <div key="forge-empty-state" className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem]">
                                <Code2 className="w-16 h-16 text-white/5 mb-6" />
                                <p className="text-[14px] font-black text-white/20 uppercase tracking-[1em] ml-[1em]">Facility_Idle</p>
                                <p className="text-[9px] text-white/10 uppercase tracking-widest mt-4">No_Agents_Currently_In_Production</p>
                            </div>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* Neural Core & Forge Logs */}
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Neural Core Visualizer */}
                    <div className="lg:col-span-2 glass-v-series rounded-[3rem] p-10 bg-amber-500/[0.02] border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[300px]">
                        <div className="absolute inset-0 opacity-10">
                            <Waves className="w-full h-full text-amber-500 animate-pulse" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 180, 270, 360],
                                        borderRadius: ["20%", "50%", "20%"]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="w-40 h-40 border-4 border-amber-500/30 flex items-center justify-center shadow-neon-amber/20"
                                >
                                    <BrainCircuit size={80} className="text-amber-500 animate-pulse" />
                                </motion.div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-60 h-60 border border-amber-500/10 rounded-full animate-ping" />
                                </div>
                            </div>
                            <div className="mt-10 text-center">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">Neural_Core_Status: Optimal</span>
                                <div className="flex gap-1 justify-center mt-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-1 h-3 bg-amber-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Forge Technical Logs */}
                    <div className="glass-v-series rounded-[3rem] p-10 bg-white/[0.01] border border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} /> Production_Log
                            </span>
                            <ShieldCheck size={14} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 space-y-4 font-mono text-[9px]">
                            {forgeLogs.map((log, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={`${log}-${i}`}
                                    className="flex items-center gap-3 text-white/30 border-b border-white/5 pb-2"
                                >
                                    <span className="text-amber-500/40">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="text-white/60 tracking-tighter truncate">{log}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase text-white/20">
                            <span>Sovereign_OS_v4.2</span>
                            <span className="animate-pulse">Monitoring...</span>
                        </div>
                    </div>
                </div>

                {/* Global Forge Status */}
                <div className="grid grid-cols-3 gap-8 py-8 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <Activity className="text-amber-500" size={20} />
                        <div>
                            <span className="text-[10px] font-black text-white/20 uppercase block tracking-widest">Global_Neural_Load</span>
                            <span className="text-sm font-black text-white italic tracking-tighter">
                                {agents.filter(a => a.status === 'ACTIVE').length > 0 ? (14 + agents.filter(a => a.status === 'ACTIVE').length * 8.5).toFixed(2) : '0.00'}% OPERATIONAL
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Zap className="text-amber-500" size={20} />
                        <div>
                            <span className="text-[10px] font-black text-white/20 uppercase block tracking-widest">Total_Executions</span>
                            <span className="text-sm font-black text-white italic tracking-tighter">1,429 UNITS_PROCESSED</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Shield className="text-amber-500" size={20} />
                        <div>
                            <span className="text-[10px] font-black text-white/20 uppercase block tracking-widest">Protocol_Security</span>
                            <span className="text-sm font-black text-white italic tracking-tighter">QUANTUM_STABLE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
