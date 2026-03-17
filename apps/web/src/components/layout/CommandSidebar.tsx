'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, Target, Clock, Hammer, BookOpen,
    Coins, Activity, Database, Shield, Zap,
    LayoutGrid, Users, Scale, Server, Settings,
    LogOut, ChevronRight, Menu, Sparkles, Fingerprint
} from 'lucide-react';
import { useSound } from '@/providers/SoundProvider';

const CATEGORIES = [
    {
        id: 'strategic',
        label: 'STRATEGIC HUB',
        modules: [
            { id: 'global-command', label: 'Global Command', icon: Globe },
            { id: 'mission-engine', label: 'Mission Engine', icon: Target },
            { id: 'high-scheduler', label: 'High Scheduler', icon: Clock },
            { id: 'protocol-forge', label: 'Protocol Forge', icon: Hammer },
            { id: 'legacy-loom', label: 'Legacy Loom', icon: BookOpen },
        ]
    },
    {
        id: 'financial',
        label: 'FINANCIAL WARFARE',
        modules: [
            { id: 'wealth-engine', label: 'Wealth Engine', icon: Coins },
            { id: 'financial-sniper', label: 'Financial Sniper', icon: Zap },
            { id: 'market-oracle', label: 'Market Oracle', icon: Activity },
            { id: 'asset-vault', label: 'Asset Vault', icon: Shield },
            { id: 'liquidity-map', label: 'Liquidity Map', icon: Database },
        ]
    },
    {
        id: 'ops',
        label: 'OPERATIONS',
        modules: [
            { id: 'cyber-erp', label: 'Cyber ERP', icon: LayoutGrid },
            { id: 'legal-architect', label: 'Legal Architect', icon: Scale },
            { id: 'global-logistics', label: 'Global Logistics', icon: Server },
        ]
    }
];

export default function CommandSidebar() {
    const pathname = usePathname();
    const { playClick } = useSound();
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 100 : 340 }}
            className="h-screen bg-carbon-black border-r border-white/5 flex flex-col relative z-50 overflow-hidden shadow-2xl landscape-optimized-sidebar"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-hyper-cyan/[0.02] to-transparent pointer-events-none" />

            {/* Sidebar Header */}
            <div className="p-10 flex items-center justify-between relative z-10 landscape-optimized-header">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-hyper-cyan/10 rounded-2xl flex items-center justify-center border border-hyper-cyan/20 shadow-neon-cyan/20 group cursor-pointer hover:bg-hyper-cyan/20 transition-all duration-500">
                            <Shield size={20} className="text-hyper-cyan group-hover:scale-110 transition-transform shadow-neon-cyan" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-[0.2em] text-white italic">SOVEREIGN</span>
                            <span className="text-[8px] font-black text-white/30 tracking-[0.4em] uppercase">SYSTEM_NODE_0X8F</span>
                        </div>
                    </motion.div>
                )}
                {collapsed && (
                    <div className="w-10 h-10 bg-hyper-cyan/10 rounded-2xl flex items-center justify-center border border-hyper-cyan/20 shadow-neon-cyan/20">
                        <Shield size={20} className="text-hyper-cyan shadow-neon-cyan" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-hyper-cyan group"
                >
                    <Menu size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-8 space-y-12 py-6 relative z-10 landscape-optimized-gap">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-6">
                        {!collapsed && (
                            <div className="flex items-center gap-3 ml-4">
                                <div className="h-px w-4 bg-hyper-cyan/20" />
                                <h3 className="text-[9px] font-black text-white/30 tracking-[0.5em] uppercase">
                                    {cat.label}
                                </h3>
                            </div>
                        )}
                        <div className="space-y-2">
                            {cat.modules.map((mod) => {
                                const isActive = pathname?.includes(mod.id) || (mod.id === 'global-command' && pathname === '/en/war-room');
                                return (
                                    <Link key={mod.id} href={`/en/war-room?module=${mod.id}`}>
                                        <div className={`
                                            group flex items-center gap-5 p-5 rounded-[1.5rem] transition-all duration-500 relative overflow-hidden font-mono
                                            ${isActive
                                                ? 'bg-white/[0.03] text-white border border-white/5 shadow-premium'
                                                : 'text-white/30 hover:text-white hover:bg-white/[0.01] hover:translate-x-1 border border-transparent'}
                                        `}>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-nav-glow"
                                                    className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-hyper-cyan/50 to-transparent"
                                                />
                                            )}

                                            <div className={`
                                                p-3 rounded-xl transition-all duration-500
                                                ${isActive ? 'bg-hyper-cyan/10 text-hyper-cyan shadow-neon-cyan/20' : 'bg-transparent group-hover:text-hyper-cyan'}
                                            `}>
                                                <mod.icon size={22} className={isActive ? 'shadow-neon-cyan' : ''} />
                                            </div>

                                            {!collapsed && (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black tracking-tight uppercase italic">{mod.label}</span>
                                                    {isActive && (
                                                        <motion.span
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-[8px] text-hyper-cyan font-black tracking-[0.2em] italic"
                                                        >
                                                            STATUS: OPTIMIZED
                                                        </motion.span>
                                                    )}
                                                </div>
                                            )}

                                            {!collapsed && isActive && (
                                                <div className="ml-auto flex items-center gap-2">
                                                    <Sparkles size={12} className="text-hyper-cyan/40 animate-pulse" />
                                                    <ChevronRight size={14} className="text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Bar */}
            <div className="p-10 border-t border-white/5 relative z-10 bg-black/20">
                <div className="flex items-center gap-5 group cursor-pointer">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-carbon-black border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-hyper-cyan/40 shadow-premium">
                            <Fingerprint size={24} className="text-hyper-cyan/40 group-hover:text-hyper-cyan transition-colors" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-hyper-cyan border-4 border-carbon-black animate-pulse shadow-neon-cyan" />
                    </div>

                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white italic tracking-tight uppercase">Commander_NSC</span>
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">Auth: Level_Elite</span>
                        </div>
                    )}

                    {!collapsed && (
                        <button className="ml-auto p-3 hover:bg-electric-violet/10 rounded-xl text-white/20 hover:text-electric-violet transition-all duration-500 group/exit">
                            <LogOut size={20} className="group-hover/exit:-translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        </motion.aside>
    );
}

