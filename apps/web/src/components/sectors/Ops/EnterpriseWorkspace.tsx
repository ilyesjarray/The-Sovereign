'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Mail, Shield, Check,
    X, Send, LayoutGrid, Clock, Briefcase,
    ChevronRight, Search, Activity, Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Invite = {
    id: string;
    invitee_email: string;
    status: 'PENDING' | 'ACCEPTED';
    created_at: string;
};

export default function EnterpriseWorkspace() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('team_invites')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setInvites(data);
        setIsLoading(false);
    };

    const sendInvite = async () => {
        if (!email.trim() || !email.includes('@')) return;
        setIsSending(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { error } = await supabase
                .from('team_invites')
                .insert([{
                    owner_id: session.user.id,
                    invitee_email: email,
                    status: 'PENDING'
                }]);

            if (!error) {
                setEmail('');
                fetchInvites();
            }
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500">
                                <Briefcase size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Enterprise_Workspace</h1>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-mono">B2B_Environment // Team_Sync</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Workspace_Active</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                    {/* Left: Invite System */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <div className="flex items-center gap-3">
                                <UserPlus size={20} className="text-hyper-cyan" />
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Deploy_Personnel</h3>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed font-mono uppercase tracking-wider">
                                Invite analysts and executives to your mission space.
                            </p>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="TARGET_EMAIL_ADDRESS"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-mono text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all uppercase"
                                    />
                                </div>
                                <button
                                    onClick={sendInvite}
                                    disabled={isSending || !email.trim()}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                                        isSending ? "bg-white/5 text-white/20" : "bg-hyper-cyan text-carbon-black hover:shadow-neon-cyan"
                                    )}
                                >
                                    {isSending ? 'Transmitting...' : (
                                        <>
                                            <span>Send_Team_Invite</span>
                                            <Send size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Usage Card */}
                        <div className="p-8 bg-indigo-500 text-carbon-black rounded-[3rem] space-y-4 relative overflow-hidden">
                            <Shield size={120} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Seat_Availability</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black italic"> 4 / 20 </span>
                                <span className="text-[10px] font-black uppercase opacity-60 italic">Elite_Licenses</span>
                            </div>
                            <div className="h-1 bg-carbon-black/10 rounded-full overflow-hidden">
                                <motion.div animate={{ width: '20%' }} className="h-full bg-carbon-black" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Team List */}
                    <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col space-y-8 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <Users size={16} className="text-hyper-cyan" />
                                <span>Deployment_Status</span>
                            </h3>
                            <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase">
                                <Activity size={12} className="text-hyper-cyan" />
                                <span>Realtime_Sync</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {invites.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-10">
                                    <Users size={60} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Grid_Empty</span>
                                </div>
                            ) : invites.map((invite) => (
                                <div key={invite.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Mail size={16} className="text-white/20" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase italic tracking-tight">{invite.invitee_email}</h4>
                                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">{new Date(invite.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                                            invite.status === 'ACCEPTED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5"
                                        )}>
                                            {invite.status === 'ACCEPTED' ? <Check size={10} /> : <Clock size={10} />}
                                            <span>{invite.status}</span>
                                        </div>
                                        <button className="text-white/0 group-hover:text-rose-500 transition-all">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                        Workspace_Encryption: AES_256 // Quantum_Ready
                    </div>
                </div>

            </div>
        </div>
    );
}
