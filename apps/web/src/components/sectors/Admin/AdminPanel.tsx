'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Activity, Crown, Shield } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface AdminStats {
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
    tierDistribution: { tier: string; count: number }[];
}

export function AdminPanel() {
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        tierDistribution: []
    });

    useEffect(() => {
        const loadRealStats = async () => {
            const supabase = createClient();
            try {
                const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
                const { data: subs } = await supabase.from('user_subscriptions').select('tier, status');

                const active = subs?.filter(s => s.status === 'active').length || 0;
                const dist = subs?.reduce((acc: any[], s) => {
                    const ex = acc.find(t => t.tier === s.tier);
                    if (ex) ex.count++; else acc.push({ tier: s.tier, count: 1 });
                    return acc;
                }, []) || [];

                setStats({
                    totalUsers: userCount || 0,
                    activeSubscriptions: active,
                    totalRevenue: active * 99,
                    tierDistribution: dist
                });
            } catch (e) {
                console.warn('[Admin]: Sync error', e);
            }
        };
        loadRealStats();
    }, []);

    return (
        <div className="p-8 h-full custom-scrollbar overflow-y-auto bg-transparent">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">
                        <span className="text-hyper-cyan">ADMIN</span>_COMMAND_CENTER
                    </h2>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">
                        <Shield size={12} className="text-hyper-cyan" />
                        PLATFORM_ANALYTICS & CORE_MANAGEMENT_STATION
                    </div>
                </div>
                <Link
                    href="/acquisition"
                    className="px-6 py-3 bg-hyper-cyan/10 border border-hyper-cyan/20 hover:bg-hyper-cyan hover:text-carbon-black rounded-xl text-[10px] font-black text-hyper-cyan uppercase tracking-widest transition-all italic flex items-center gap-3 shadow-neon-cyan/20"
                >
                    <Crown size={14} />
                    ACTIVATE_ACQUISITION_PROTOCOL
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total_Identities', val: stats.totalUsers, icon: Users, color: 'blue' },
                    { label: 'Active_Nodes', val: stats.activeSubscriptions, icon: Activity, color: 'emerald' },
                    { label: 'Imperial_MRR', val: `$${stats.totalRevenue}`, icon: DollarSign, color: 'purple' },
                    { label: 'System_Growth', val: stats.totalUsers > 5 ? `+${(stats.activeSubscriptions / stats.totalUsers * 100).toFixed(1)}%` : '+100%', icon: TrendingUp, color: 'amber' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-v-series rounded-2xl p-6 border border-white/5 bg-white/[0.02] shadow-xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-hyper-cyan/5 border border-hyper-cyan/20 flex items-center justify-center">
                                <stat.icon size={20} className="text-hyper-cyan" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white italic">{stat.val}</div>
                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest font-mono">{stat.label}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tier Distribution */}
            <div className="glass-v-series rounded-3xl p-8 border border-white/5 bg-white/[0.01]">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                    <Crown size={20} className="text-hyper-cyan" />
                    SUBSCRIPTION_TIER_DISTRIBUTION
                </h3>
                <div className="space-y-4">
                    {stats.tierDistribution.map((tier) => (
                        <div key={tier.tier} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-hyper-cyan/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white/5 border-white/10 group-hover:border-hyper-cyan/40 group-hover:bg-hyper-cyan/5 transition-all">
                                    {tier.tier === 'ELITE' && <Crown className="w-5 h-5 text-hyper-cyan" />}
                                    {tier.tier === 'SOVEREIGN' && <Shield className="w-5 h-5 text-hyper-cyan" />}
                                    {tier.tier === 'GUEST' && <Users className="w-5 h-5 text-white/40" />}
                                </div>
                                <div>
                                    <span className="text-white font-black uppercase tracking-widest italic group-hover:text-hyper-cyan transition-colors">{tier.tier}</span>
                                    <div className="text-[8px] text-white/20 uppercase font-mono tracking-[0.3em]">SECURE_NODE_IDENTIFIED</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 font-black text-lg italic group-hover:text-white transition-colors">{tier.count}</div>
                                <div className="text-[8px] text-white/20 uppercase font-mono tracking-[0.2em]">REGISTERED</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
