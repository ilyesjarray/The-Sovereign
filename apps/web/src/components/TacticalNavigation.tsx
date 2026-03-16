'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutGrid, Binary, Layers, Zap, Globe,
    Settings, Shield, ChevronRight, Cpu, Users
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function TacticalNavigation() {
    const pathname = usePathname();

    const navItems = [
        { id: 'os', label: 'Command_OS', icon: Cpu, href: '/' },
        { id: 'community-nexus', label: 'Imperial_Nexus', icon: Users, href: '/' },
        { id: 'neural', label: 'Neural_Oracle', icon: Binary, href: '/' },
        { id: 'temporal', label: 'Chrono_Governor', icon: Layers, href: '/' },
        { id: 'wealth', label: 'Wealth_Forge', icon: Zap, href: '/' },
        { id: 'ops', label: 'Liaison_Core', icon: Globe, href: '/' },
        { id: 'system-settings', label: 'Core_Settings', icon: Settings, href: '/' },
    ];

    return (
        <aside className="w-20 lg:w-72 h-screen flex flex-col bg-carbon-black border-r border-white/5 relative z-50">
            {/* Logo Sector */}
            <div className="h-24 flex items-center px-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-hyper-cyan/10 flex items-center justify-center border border-hyper-cyan/30 shadow-neon-cyan">
                    <Shield size={20} className="text-hyper-cyan" />
                </div>
                <div className="hidden lg:flex flex-col ml-4">
                    <span className="text-sm font-black text-white tracking-widest uppercase italic">Sovereign</span>
                    <span className="text-[9px] text-hyper-cyan font-bold tracking-[0.4em] uppercase">V-Series_Elite</span>
                </div>
            </div>

            {/* Navigation Sector */}
            <nav className="flex-1 px-4 py-10 space-y-4">
                {navItems.map((item) => {
                    const isActive = pathname.includes(item.id);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl transition-all duration-500 group relative",
                                isActive ? "bg-hyper-cyan/10 text-white" : "text-white/30 hover:bg-white/[0.02] hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute left-0 w-1 h-6 bg-hyper-cyan rounded-r-full shadow-neon-cyan"
                                />
                            )}
                            <Icon size={20} className={cn("transition-colors", isActive ? "text-hyper-cyan" : "group-hover:text-hyper-cyan/60")} />
                            <div className="hidden lg:block">
                                <span className="text-[11px] font-black uppercase tracking-widest italic">{item.label}</span>
                            </div>
                            <ChevronRight size={14} className={cn("ml-auto hidden lg:block transition-transform", isActive ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0")} />
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Sector */}
            <div className="p-6 border-t border-white/5 space-y-4">
                <div className="hidden lg:block glass-v-series p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-hyper-cyan animate-pulse shadow-neon-cyan" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-mono italic">Node_Alpha_Synced</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
