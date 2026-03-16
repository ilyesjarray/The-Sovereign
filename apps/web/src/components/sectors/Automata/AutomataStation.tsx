'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Cpu,
    Zap,
    Shield,
    Activity,
    Play,
    Square,
    TrendingUp,
    AlertCircle,
    Power
} from 'lucide-react';
import { AutomataService, BotState } from '@/lib/services/automata-service';
import { cn } from '@/lib/utils';

export function AutomataStation() {
    const [bots, setBots] = useState<BotState[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeBotId, setActiveBotId] = useState<string | null>(null);

    useEffect(() => {
        const service = AutomataService.getInstance();
        setBots(service.getBots());
        setLoading(false);

        const interval = setInterval(() => {
            setBots([...service.getBots()]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const toggleBot = (botId: string) => {
        const service = AutomataService.getInstance();
        const bot = bots.find(b => b.id === botId);
        if (bot?.status === 'IDLE') {
            service.startBot(botId);
        } else {
            service.stopBot(botId);
        }
        setBots([...service.getBots()]);
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10">

                {/* Station Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center shadow-neon-cyan/20">
                            <Bot className="w-8 h-8 text-hyper-cyan" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Automata_Station</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-1">Autonomous_Execution_Hub</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Global_Efficiency</span>
                            <div className="text-xl font-black text-emerald-500 italic">98.4%</div>
                        </div>
                        <button className="px-8 py-4 bg-white text-carbon-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-hyper-cyan transition-all">
                            Spawn_New_Automata
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                    {/* Bot Fleet */}
                    <div className="lg:col-span-2 space-y-6 overflow-y-auto custom-scrollbar pr-4">
                        <div className="flex items-center gap-3 px-2">
                            <Cpu className="text-hyper-cyan" size={16} />
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Active_Fleet_Status</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bots.map((bot) => (
                                <motion.div
                                    key={bot.id}
                                    layout
                                    className={cn(
                                        "p-8 glass-v-series rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden",
                                        bot.status !== 'IDLE' ? "bg-hyper-cyan/[0.03] border-hyper-cyan/30 shadow-neon-cyan/5" : "bg-white/[0.01] border-white/5 grayscale"
                                    )}
                                    onClick={() => setActiveBotId(bot.id)}
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Bot size={120} className="text-white" />
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white italic tracking-tighter uppercase">{bot.name}</span>
                                            <span className="text-[8px] font-mono text-white/30 uppercase mt-1">{bot.id}</span>
                                        </div>
                                        <div className={cn(
                                            "w-3 h-3 rounded-full shadow-lg",
                                            bot.status === 'RUNNING' ? "bg-emerald-500 shadow-neon-emerald animate-pulse" :
                                                bot.status === 'HEDGING' ? "bg-amber-500 shadow-neon-amber animate-pulse" : "bg-white/10"
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="space-y-1">
                                            <span className="text-[8px] text-white/20 uppercase tracking-widest">Bot_Profit</span>
                                            <div className="text-lg font-black text-white italic">${bot.profit.toFixed(2)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] text-white/20 uppercase tracking-widest">Last_Action</span>
                                            <div className="text-[10px] font-mono text-hyper-cyan uppercase truncate">{bot.lastAction}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBot(bot.id); }}
                                            className={cn(
                                                "flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                                bot.status === 'IDLE'
                                                    ? "bg-hyper-cyan text-carbon-black hover:shadow-neon-cyan"
                                                    : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                            )}
                                        >
                                            {bot.status === 'IDLE' ? <Play size={14} /> : <Square size={14} />}
                                            {bot.status === 'IDLE' ? 'Activate' : 'Deactivate'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Fleet Analytics */}
                    <div className="glass-v-series rounded-[3rem] bg-white/[0.01] border border-white/10 p-8 flex flex-col space-y-8 h-full">
                        <div className="flex items-center gap-3">
                            <Activity className="text-hyper-cyan" size={18} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Fleet_Neural_Feed</h3>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <TrendingUp className="text-emerald-500" size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-white/40 uppercase tracking-widest block">Total_Fleet_Yield</span>
                                        <div className="text-xl font-black text-white">$12,492.20</div>
                                    </div>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-emerald-500 shadow-neon-emerald" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block px-2">Operational_History</span>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 px-2 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-hyper-cyan shadow-neon-cyan" />
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase group-hover:text-hyper-cyan transition-colors">TR-NODE_{i + 102} Execution</div>
                                                <div className="text-[8px] font-mono text-white/20 uppercase mt-0.5">Success // 14:2{i}:05</div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-500">+$12.40</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                <div>
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Protocol_Alert</span>
                                    <p className="text-[9px] text-white/40 mt-1 uppercase leading-relaxed font-mono">Market volatility detected in SOL/USDC Pair. SENTINEL bots adjusting risk parameters.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pulse Command Feed */}
                        <div className="flex-1 min-h-[150px] bg-black/40 border border-white/5 rounded-2xl p-6 font-mono overflow-hidden relative">
                            <div className="absolute top-2 right-4 flex gap-1">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[6px] text-emerald-500 font-black uppercase">LIVE_FEED</span>
                            </div>
                            <div className="space-y-2 opacity-40">
                                {[...Array(10)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                                        className="text-[7px] text-white/60 lowercase"
                                    >
                                        <span className="text-white/20">[{new Date().toLocaleTimeString()}]</span> exec_node_{i + 100} :: signal_detected :: probability_0.982
                                    </motion.div>
                                ))}
                            </div>
                            <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                <Activity size={10} className="text-hyper-cyan animate-pulse" />
                                <span className="text-[7px] font-black text-hyper-cyan uppercase tracking-widest italic">NEURAL_DECODER_SYNCHRONIZED</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                        Fleet_Status: OPTIMAL // Nodes_Active: 4
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield size={14} className="text-hyper-cyan" />
                        <span className="text-[8px] font-mono text-white/10 uppercase italic">Encryption_Layer: QUANTUM_SECURE</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
