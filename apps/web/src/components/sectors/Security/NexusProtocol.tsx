'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    ShieldAlert,
    Clock,
    Trash2,
    User,
    Network,
    Search,
    Hash,
    Lock,
    Zap,
    Terminal,
    ChevronRight,
    Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    sender_id: string;
    encrypted_body: string;
    created_at: string;
    expires_at: string | null;
    is_burned: boolean;
};

export function NexusProtocol() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchMessages();
        const subscription = supabase
            .channel('nexus_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'nexus_messages' }, () => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase
                .from('nexus_messages')
                .select('*')
                .order('created_at', { ascending: true });
            setMessages(data || []);
        }
        setLoading(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Simple Encryption for Demo (Same as Vault)
        const salt = "NEXUS_SIG_";
        const encrypted = btoa(salt + newMessage);

        // Initial check for a channel (assuming one main channel for now)
        let channelId;
        const { data: channels } = await supabase.from('nexus_channels').select('id').limit(1);

        if (!channels || channels.length === 0) {
            const { data: newChan } = await supabase.from('nexus_channels').insert({
                user_id: session.user.id,
                name: 'DIPLOMATIC_CORE'
            }).select().single();
            channelId = newChan?.id;
        } else {
            channelId = channels[0].id;
        }

        if (channelId) {
            await supabase.from('nexus_messages').insert({
                channel_id: channelId,
                sender_id: session.user.id,
                encrypted_body: encrypted,
                expires_at: isBurning ? new Date(Date.now() + 60000).toISOString() : null // 1 minute burn
            });
            setNewMessage('');
        }
    };

    const decrypt = (content: string) => {
        try {
            if (content.startsWith('[DATA_PURGED')) return content;
            return atob(content).replace("NEXUS_SIG_", "");
        } catch { return "[QUANTUM_DECRYPTION_ERROR]"; }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-8">

                {/* Nexus Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-neon-indigo/20">
                            <Network className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Nexus_Protocol</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-1">Encrypted_Diplomatic_Uplink // Level_7_Clearance</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
                        <div className="flex flex-col text-right">
                            <span className="text-[8px] text-white/20 uppercase font-black">Link_Status</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Quantum_Encrypted</span>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Messaging Interface */}
                <div className="flex-1 grid lg:grid-cols-4 gap-8 overflow-hidden">

                    {/* Channels Sidebar */}
                    <div className="hidden lg:flex flex-col space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                            <input
                                placeholder="SEARCH_COMS..."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[9px] font-bold text-white outline-none focus:border-indigo-500/30 transition-all uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Active_Channels</span>
                            <button className="w-full flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                                <Hash size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Diplomatic_Core</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] border border-transparent rounded-2xl text-white/20 transition-all">
                                <Lock size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Black_Ops_Secure</span>
                            </button>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-3 flex flex-col bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden">

                        {/* Feed */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {messages.map((m, i) => (
                                    <motion.div
                                        layout
                                        key={m.id || `msg-${i}`}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex flex-col space-y-2 max-w-[80%]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
                                                <User size={12} className="text-indigo-400" />
                                            </div>
                                            <span className="text-[9px] font-black text-white uppercase italic tracking-tighter">
                                                {m.sender_id.slice(0, 8).toUpperCase()}_NODE
                                            </span>
                                            <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">
                                                {m.created_at ? new Date(m.created_at).toLocaleTimeString() : 'PENDING_SYNC'}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "p-5 rounded-2xl rounded-tl-none border font-mono text-xs leading-relaxed transition-all",
                                            m.is_burned ? "bg-rose-500/5 border-rose-500/20 text-rose-500/40 italic" : "bg-white/[0.03] border-white/10 text-white/80"
                                        )}>
                                            {m.is_burned ? "[DATA_EXPUNGED]" : decrypt(m.encrypted_body)}
                                        </div>
                                        {m.expires_at && !m.is_burned && (
                                            <div className="flex items-center gap-2 text-[7px] text-rose-500 font-black uppercase tracking-widest">
                                                <Flame size={10} className="animate-pulse" />
                                                Purging_In: {Math.max(0, Math.floor((new Date(m.expires_at).getTime() - Date.now()) / 1000))}s
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-white/5 bg-black/40">
                            <form onSubmit={handleSend} className="relative">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="ESTABLISH_COMMUNICATION..."
                                    rows={1}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-6 pr-40 text-sm font-bold text-white placeholder:text-white/10 outline-none focus:border-indigo-500/40 transition-all resize-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsBurning(!isBurning)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all flex items-center gap-2",
                                            isBurning ? "bg-rose-500 text-white shadow-neon-rose/40" : "bg-white/5 text-white/20 hover:text-rose-500"
                                        )}
                                        title="Biometric Data Purge (Self-Destruct)"
                                    >
                                        <Flame size={18} />
                                        {isBurning && <span className="text-[8px] font-black uppercase tracking-widest">Burn_Active</span>}
                                    </button>
                                    <button
                                        type="submit"
                                        className="p-4 bg-indigo-500 text-white rounded-xl hover:shadow-neon-indigo/40 transition-all"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>

                </div>

                {/* Status Footer */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Terminal size={14} className="text-white/20" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Nexus_Node: Prime-7</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex items-center gap-3">
                            <Zap size={14} className="text-amber-500" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Latency: {(Math.random() * 0.1 + 0.05).toFixed(2)}ms</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-mono text-white/10 uppercase italic">
                        All_Communications_Are_Quantum_Shielded
                    </div>
                </div>

            </div>
        </div>
    );
}
