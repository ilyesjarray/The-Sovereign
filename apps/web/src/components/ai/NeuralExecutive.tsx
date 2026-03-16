'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, Zap, Shield, FileText, TrendingUp, AlertTriangle, BarChart3, Cloud } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    actions?: string[];
}

const GhostTyping = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i++;
            if (i > text.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}<span className="animate-pulse">_</span></span>;
};

const WhaleTracker = () => (
    <div className="hud-border bg-black/60 p-6 flex flex-col gap-4 mb-4 border-neon-blue/10">
        <div className="flex items-center justify-between border-b border-neon-blue/5 pb-3">
            <span className="text-[9px] text-neon-blue font-black tracking-[0.4em] uppercase flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> NEYDRA_WHALE_MONITOR
            </span>
            <span className="text-[7px] text-neon-blue/20 font-mono italic uppercase">DEPTH_OF_FIELD: ACTIVE</span>
        </div>
        <div className="flex items-end gap-1.5 h-24 px-2">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${20 + Math.random() * 60}%` }}
                        className={`w-full ${i % 3 === 0 ? 'bg-red-500/40 shadow-[0_0_10px_#FF000020]' : 'bg-neon-blue/40 shadow-[0_0_10px_#00F3FF20]'} group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="w-0.5 h-4 bg-neon-blue/20" />
                </div>
            ))}
        </div>
        <div className="text-[8px] text-neon-blue/30 font-mono uppercase text-center mt-2 tracking-widest">
            NEYDRA_DETECTS_ANOMALY: WALL_ST_LIQUIDITY_GAP
        </div>
    </div>
);

const SentimentCloud = () => (
    <div className="absolute top-10 right-10 w-48 h-48 pointer-events-none opacity-20 blur-[2px] hover:blur-none transition-all duration-700">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-full h-full relative"
        >
            <Cloud className="w-full h-full text-sovereign-blue animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-sovereign-blue tracking-[0.3em] uppercase">BULLISH</span>
            </div>
        </motion.div>
    </div>
);

export function NeuralExecutive() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'NEYDRA_EXECUTIVE_ONLINE. Strategic multi-vector analysis active. Command sequence required.'
        }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            let response: Message = {
                role: 'assistant',
                content: 'Intercepting institution flows... Neydra identifies critical leverage point in offshore nodes.'
            };

            if (input.toLowerCase().includes('whale')) {
                response = {
                    role: 'assistant',
                    content: 'Whale Monitor updated. 4.2k BTC moved to private vault. Strategic alignment protocol suggested.'
                };
            }

            setMessages(prev => [...prev, response]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-black/60 relative overflow-hidden font-mono">
            <SentimentCloud />

            {/* Terminal Header */}
            <div className="border-b border-neon-blue/10 p-5 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-neon-blue shadow-[0_0_10px_#00F3FF] rounded-full animate-flicker" />
                    <span className="text-[10px] text-neon-blue font-black tracking-[0.6em] uppercase">NEYDRA_CORE_V4</span>
                </div>
                <div className="text-[8px] text-neon-blue/30 uppercase tracking-[0.3em]">Neural_Load: 0.12ms</div>
            </div>

            {/* Content Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10"
            >
                <WhaleTracker />

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={`p-6 rounded-xl max-w-[85%] border transition-all ${msg.role === 'user'
                                    ? 'bg-sovereign-blue/10 border-sovereign-blue/30 text-sovereign-blue'
                                    : 'bg-black border-neon-blue/10 text-neon-blue shadow-2xl'
                                }`}>
                                <div className="flex items-center gap-3 mb-4 opacity-40">
                                    <span className="text-[8px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'SOVEREIGN_OP' : 'NEYDRA_EXECUTIVE'}</span>
                                    <div className="h-[1px] w-4 bg-current" />
                                </div>
                                <div className="text-xs leading-relaxed tracking-tight">
                                    {msg.role === 'assistant' ? <GhostTyping text={msg.content} /> : msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input Buffer */}
            <div className="p-6 bg-black border-t border-neon-blue/10 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
                <div className="relative flex items-center">
                    <span className="absolute left-6 text-neon-blue font-mono text-lg font-black italic">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="INPUT_NEURAL_COMMAND..."
                        className="w-full bg-neon-blue/[0.03] border border-neon-blue/20 p-5 pl-12 text-neon-blue font-mono text-sm focus:outline-none focus:border-neon-blue/50 transition-all placeholder:text-neon-blue/10 rounded-lg italic"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-6 text-neon-blue/40 hover:text-neon-blue transition-colors"
                    >
                        <Zap className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
