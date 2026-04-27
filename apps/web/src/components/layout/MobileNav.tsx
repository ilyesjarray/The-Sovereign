'use client';

import { motion } from 'framer-motion';
import {
    Binary, Sword, BrainCircuit, Clock, Users,
    HardDrive, ShieldAlert, Radio, Search, MessageSquare,
    Wallet, Zap, BarChart3, Activity, Radar,
    Calendar, Mic, Target, Bot, LayoutGrid, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV_ITEMS = [
    { id: 'market-oracle', label: 'ORACLE', icon: Binary },
    { id: 'the-armory', label: 'TREASURY', icon: Wallet },
    { id: 'digital-scouts', label: 'INTEL', icon: Radio },
    { id: 'the-forge', label: 'FORGE', icon: BrainCircuit },
    { id: 'mission-control', label: 'OPS', icon: Target },
];

interface MobileNavProps {
    currentSector: string;
    onSectorChange: (id: string) => void;
    onExpandMenu: () => void;
}

export function MobileNav({ currentSector, onSectorChange, onExpandMenu }: MobileNavProps) {
    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[200] bg-black/90 backdrop-blur-2xl border-t border-white/10 px-2 pb-[env(safe-area-inset-bottom)] safe-area-bottom"
        >
            <div className="flex items-center justify-around h-16">
                {MOBILE_NAV_ITEMS.map((item) => {
                    const isActive = currentSector === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectorChange(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px]",
                                isActive
                                    ? "text-hyper-cyan"
                                    : "text-white/30"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                isActive ? "bg-hyper-cyan/20 shadow-neon-cyan" : ""
                            )}>
                                <item.icon size={18} />
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-indicator"
                                    className="absolute bottom-0 w-8 h-0.5 bg-hyper-cyan rounded-full shadow-neon-cyan"
                                />
                            )}
                        </button>
                    );
                })}
                {/* More button */}
                <button
                    onClick={onExpandMenu}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-white/30"
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <LayoutGrid size={18} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest">MORE</span>
                </button>
            </div>
        </motion.nav>
    );
}

// Full sector list for the "More" menu
export const ALL_MOBILE_SECTORS = [
    { group: 'NEURAL', sectors: [
        { id: 'market-oracle', label: 'THE_HIGH_ORACLE', icon: Binary },
        { id: 'war-council', label: 'STRATAGEM_COUNCIL', icon: Sword },
        { id: 'the-forge', label: 'GENESIS_ENGINE', icon: BrainCircuit },
        { id: 'temporal-engine', label: 'CHRONOS_SINGULARITY', icon: Clock },
        { id: 'sovereign-social', label: 'COMMUNITY_PROTOCOL', icon: Users },
    ]},
    { group: 'SECURITY', sectors: [
        { id: 'the-citadel', label: 'THE_IMPERIAL_BASTION', icon: HardDrive },
        { id: 'sovereign-vault', label: 'THE_CRYPT', icon: ShieldAlert },
        { id: 'digital-scouts', label: 'SHADOW_WATCH', icon: Radio },
        { id: 'intelligence-nexus', label: 'INTELLIGENCE_NEXUS', icon: Search },
        { id: 'nexus-protocol', label: 'NEXUS_UPLINK', icon: MessageSquare },
    ]},
    { group: 'FINANCE', sectors: [
        { id: 'the-armory', label: 'SOVEREIGN_TREASURY', icon: Wallet },
        { id: 'wealth-engine', label: 'ASSET_FORGE', icon: Zap },
        { id: 'portfolio-analyst', label: 'PORTFOLIO_INTELLIGENCE', icon: BarChart3 },
        { id: 'wealth-simulator', label: 'FLEET_STRESS_TEST', icon: Activity },
        { id: 'whale-radar', label: 'DEEP_SEA_RADAR', icon: Radar },
    ]},
    { group: 'OPERATIONS', sectors: [
        { id: 'chronos', label: 'LEGACY_TEMPORAL', icon: Calendar },
        { id: 'sovereign-voice', label: 'VOICE_CORE', icon: Mic },
        { id: 'mission-control', label: 'FIELD_COMMAND', icon: Target },
        { id: 'automata-station', label: 'AUTOMATA_GRID', icon: Bot },
        { id: 'enterprise-workspace', label: 'B2B_WORKSPACE', icon: LayoutGrid },
        { id: 'admin-center', label: 'THRONE_ROOM', icon: Crown },
    ]},
];
