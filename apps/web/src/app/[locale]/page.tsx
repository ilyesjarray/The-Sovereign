'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Lock, Radar, Layers, LayoutGrid, Users, Settings, Crown, Binary, Zap, Globe, Cpu, Shield, Activity, Fingerprint, ChevronRight, Search, Target, ShieldAlert, Radio, BarChart3, Mic, BrainCircuit, HardDrive, Wallet, MessageSquare, Calendar, Check, Sword, Bot, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SovereignSplash } from '@/components/auth/SovereignSplash';
import { ModuleRenderer } from '@/components/modules/ModuleRenderer';
import { IdentityAccess } from '@/components/IdentityAccess';
import { NeuralBriefing } from '@/components/modules/NeuralBriefing';
import { useLocale } from 'next-intl';

import { createClient } from '@/lib/supabase/client';

const LOCALES = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
];

export default function LandingRoot() {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [showBriefing, setShowBriefing] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        });

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthorized(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isAuthorized === null) return null; // Prevent flicker

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-black overflow-hidden hud-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="splash"
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 1 }}
                        className="fixed inset-0 z-[1000]"
                    >
                        <SovereignSplash onComplete={() => {
                            setIsAuthorized(true);
                            setShowBriefing(true);
                        }} />
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return <SovereignOS showBriefing={showBriefing} setShowBriefing={setShowBriefing} />;
}

function SovereignOS({ showBriefing, setShowBriefing }: { showBriefing: boolean, setShowBriefing: (v: boolean) => void }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [currentSector, setCurrentSector] = useState('market-oracle');
    const terminalRef = useRef<HTMLDivElement>(null);

    // Initial boot sequence
    useEffect(() => {
        const bootSequence = [
            { type: 'system', message: 'SOVEREIGN_V-SERIES_KERNEL_BOOT_SUCCESSFUL' },
            { type: 'system', message: 'UPLINK_SECURE: NODE_ALPHA_PRIME_ONLINE' },
            { type: 'intel', message: 'NEURAL_ORACLE_SYNC: 99.8% PRECISION' },
            { type: 'alpha', message: 'EXECUTIVE_LIAISON_ACTIVE: STANDBY_FOR_COMMAND' },
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < bootSequence.length) {
                addLog(bootSequence[i].type as any, bootSequence[i].message);
                i++;
            } else {
                clearInterval(interval);
                setIsScanning(false);
            }
        }, 600);

        return () => clearInterval(interval);
    }, []);

    const addLog = (type: string, message: string) => {
        setLogs(prev => [...prev, {
            type,
            message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }].slice(-15));
    };

    useEffect(() => {
        const handleVoiceCommand = (e: any) => {
            const cmd = e.detail.command;
            processCommand(cmd);
        };
        window.addEventListener('sovereign-command', handleVoiceCommand);
        return () => window.removeEventListener('sovereign-command', handleVoiceCommand);
    }, []);

    const processCommand = (cmd: string) => {
        addLog('system', `> ${cmd}`);

        if (cmd === 'help') {
            addLog('system', 'SECTORS: NEURAL, TEMPORAL, WEALTH, OPS, VAULT, MISSIONS, INTEL, SIMULATOR, FORGE, VOICE, CITADEL, ARMORY, NEXUS, CHRONOS');
        } else if (cmd.includes('neural')) setCurrentSector('market-oracle');
        else if (cmd.includes('temporal')) setCurrentSector('high-scheduler');
        else if (cmd.includes('wealth') || cmd.includes('simulation')) setCurrentSector('wealth-simulator');
        else if (cmd.includes('ops') || cmd.includes('missions')) setCurrentSector('mission-control');
        else if (cmd.includes('vault')) setCurrentSector('sovereign-vault');
        else if (cmd.includes('intel')) setCurrentSector('digital-scouts');
        else if (cmd.includes('forge') || cmd.includes('automation')) setCurrentSector('the-forge');
        else if (cmd.includes('voice') || cmd.includes('audio')) setCurrentSector('sovereign-voice');
        else if (cmd.includes('citadel') || cmd.includes('storage')) setCurrentSector('the-citadel');
        else if (cmd.includes('armory') || cmd.includes('wallet') || cmd.includes('portfolio')) setCurrentSector('the-armory');
        else if (cmd.includes('nexus') || cmd.includes('chat') || cmd.includes('message')) setCurrentSector('nexus-protocol');
        else if (cmd.includes('chronos') || cmd.includes('temporal') || cmd.includes('time') || cmd.includes('calendar')) setCurrentSector('temporal-engine');
        else if (cmd.includes('automata') || cmd.includes('bot') || cmd.includes('spawn')) setCurrentSector('automata-station');
        // Arabic Support for Voice Navigation
        else if (cmd.includes('خزنة') || cmd.includes('الخزنة')) setCurrentSector('sovereign-vault');
        else if (cmd.includes('كشافة') || cmd.includes('تقرير')) setCurrentSector('digital-scouts');
        else if (cmd.includes('قلعة') || cmd.includes('القلعة')) setCurrentSector('the-citadel');
        else if (cmd.includes('محفظة') || cmd.includes('رصيد')) setCurrentSector('the-armory');
        else if (cmd.includes('رسالة') || cmd.includes('نيكسوس')) setCurrentSector('nexus-protocol');
        else if (cmd.includes('وقت') || cmd.includes('ساعة') || cmd.includes('زمن')) setCurrentSector('temporal-engine');
        else if (cmd.includes('روبوت') || cmd.includes('بوت') || cmd.includes('آلي')) setCurrentSector('automata-station');
    };

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        processCommand(inputValue.trim().toLowerCase());
        setInputValue('');
    };

    const DIRECTORATES = [
        {
            name: 'DIRECTORATE_NEURAL',
            label: 'المديرية العصبية',
            sectors: [
                { id: 'market-oracle', label: 'THE_HIGH_ORACLE', icon: Binary, color: 'hyper-cyan' },
                { id: 'war-council', label: 'STRATAGEM_COUNCIL', icon: Sword, color: 'text-amber-400' },
                { id: 'the-forge', label: 'GENESIS_ENGINE', icon: BrainCircuit, color: 'hyper-cyan' },
                { id: 'temporal-engine', label: 'CHRONOS_SINGULARITY', icon: Clock, color: 'text-emerald-400' },
                { id: 'sovereign-social', label: 'COMMUNITY_PROTOCOL', icon: Users, color: 'hyper-cyan' },
            ]
        },
        {
            name: 'DIRECTORATE_SECURITY',
            label: 'مديرية الأمن السيادي',
            sectors: [
                { id: 'the-citadel', label: 'THE_IMPERIAL_BASTION', icon: HardDrive, color: 'hyper-cyan' },
                { id: 'sovereign-vault', label: 'THE_CRYPT', icon: ShieldAlert, color: 'hyper-cyan' },
                { id: 'digital-scouts', label: 'SHADOW_WATCH', icon: Radio, color: 'hyper-cyan' },
                { id: 'intelligence-nexus', label: 'INTELLIGENCE_NEXUS', icon: Search, color: 'hyper-cyan' },
                { id: 'nexus-protocol', label: 'NEXUS_UPLINK', icon: MessageSquare, color: 'hyper-cyan' },
            ]
        },
        {
            name: 'DIRECTORATE_FINANCE',
            label: 'مديرية التفوق المالي',
            sectors: [
                { id: 'the-armory', label: 'SOVEREIGN_TREASURY', icon: Wallet, color: 'hyper-cyan' },
                { id: 'wealth-engine', label: 'ASSET_FORGE', icon: Zap, color: 'hyper-cyan' },
                { id: 'portfolio-analyst', label: 'PORTFOLIO_INTELLIGENCE', icon: BarChart3, color: 'hyper-cyan' },
                { id: 'wealth-simulator', label: 'FLEET_STRESS_TEST', icon: Activity, color: 'hyper-cyan' },
                { id: 'whale-radar', label: 'DEEP_SEA_RADAR', icon: Radar, color: 'text-rose-400' },
            ]
        },
        {
            name: 'DIRECTORATE_OPERATIONS',
            label: 'مديرية العمليات العليا',
            sectors: [
                { id: 'chronos', label: 'LEGACY_TEMPORAL', icon: Calendar, color: 'hyper-cyan' },
                { id: 'sovereign-voice', label: 'VOICE_CORE', icon: Mic, color: 'hyper-cyan' },
                { id: 'mission-control', label: 'FIELD_COMMAND', icon: Target, color: 'hyper-cyan' },
                { id: 'automata-station', label: 'AUTOMATA_GRID', icon: Bot, color: 'text-emerald-400' },
                { id: 'enterprise-workspace', label: 'B2B_WORKSPACE', icon: LayoutGrid, color: 'hyper-cyan' },
                { id: 'admin-center', label: 'THRONE_ROOM', icon: Crown, color: 'hyper-cyan' },
            ]
        }
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const allSectors = DIRECTORATES.flatMap(d => d.sectors);
    const filteredDirectorates = DIRECTORATES.map(d => ({
        ...d,
        sectors: d.sectors.filter(s =>
            s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(d => d.sectors.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-carbon-black text-hyper-cyan font-sans relative overflow-hidden flex flex-col p-6 selection:bg-hyper-cyan/20 selection:text-white"
        >

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-50 bg-scanline opacity-[0.03]" />

            <AnimatePresence>
                {showBriefing && (
                    <NeuralBriefing onClose={() => setShowBriefing(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-carbon-black/95 backdrop-blur-3xl"
                    >
                        <div className="text-center space-y-8">
                            <motion.div
                                animate={{ rotate: [0, 90, 180, 270, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="relative w-32 h-32 mx-auto"
                            >
                                <Fingerprint size={128} className="text-hyper-cyan opacity-20" />
                                <div className="absolute inset-0 border-t-2 border-hyper-cyan rounded-full shadow-neon-cyan animate-pulse" />
                            </motion.div>
                            <div className="space-y-2">
                                <h2 className="text-hyper-cyan font-black tracking-[0.8em] uppercase text-sm italic">SOVEREIGN_PROTOCOL</h2>
                                <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Architecting Supreme Digital Governance</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* OS Header */}
            <header className="flex justify-between items-center h-20 px-8 relative z-20 glass-v-series rounded-2xl mb-8 border border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group cursor-pointer overflow-hidden relative">
                        <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <Image src="/logo.png" alt="Sovereign Logo" width={36} height={36} className="relative z-10 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white flex gap-2">
                            Sovereign <span className="text-hyper-cyan">OS</span>
                        </h1>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest font-mono text-white/30">
                            <span className="flex items-center gap-1"><Shield size={10} className="text-hyper-cyan" /> ELITE_CLEARANCE</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>NODE_0X8F_CYBER</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-white/[0.02] border border-white/10 rounded-xl p-1">
                        {LOCALES.map(l => (
                            <button
                                key={l.code}
                                onClick={() => { window.location.pathname = `/${l.code}`; }}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all',
                                    window.location.pathname.startsWith(`/${l.code}`)
                                        ? 'bg-hyper-cyan text-carbon-black'
                                        : 'text-white/30 hover:text-white'
                                )}
                            >
                                {l.flag} {l.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-white/20 uppercase font-black tracking-widest font-mono">NEURAL_LOAD</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-hyper-cyan italic">OPTIMIZED</span>
                            <Activity size={16} className="text-hyper-cyan animate-pulse" />
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <IdentityAccess onSectorChange={(id) => setCurrentSector(id)} />
                </div>
            </header>

            <div className="flex-1 flex gap-8 min-h-0 relative z-10">
                {/* Sector Navigation */}
                <aside className="w-24 md:w-80 flex flex-col gap-6">
                    <div className="glass-v-series rounded-3xl p-6 flex flex-col gap-4 border border-white/5 bg-white/[0.01] flex-1 overflow-hidden">
                        <div className="flex flex-col gap-4 px-2">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono">Sovereign_Sectors</span>
                            <div className="relative group">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-hyper-cyan transition-colors" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="FIND_SECTOR..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-[9px] font-bold text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all uppercase italic"
                                />
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8 mt-4">
                            {filteredDirectorates.map((dir) => (
                                <div key={dir.name} className="space-y-3">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-[8px] font-black text-hyper-cyan opacity-40 uppercase tracking-[0.3em] font-mono whitespace-nowrap">
                                            {useLocale() === 'ar' ? dir.label : dir.name}
                                        </span>
                                        <div className="h-px w-4 bg-white/5" />
                                    </div>
                                    <div className="space-y-2">
                                        {dir.sectors.map((s) => (
                                            <button
                                                key={`sector-${s.id}`}
                                                onClick={() => setCurrentSector(s.id)}
                                                className={cn(
                                                    "w-full p-3 rounded-2xl flex items-center gap-4 transition-all duration-500 border group",
                                                    currentSector === s.id
                                                        ? "bg-hyper-cyan/10 border-hyper-cyan/30 text-white"
                                                        : "bg-white/[0.01] border-transparent text-white/30 hover:bg-white/[0.03] hover:border-white/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                                    currentSector === s.id ? "bg-hyper-cyan text-carbon-black shadow-neon-cyan" : "bg-white/5"
                                                )}>
                                                    <s.icon size={16} />
                                                </div>
                                                <div className="flex-1 text-left hidden md:block overflow-hidden">
                                                    <div className="text-[10px] font-black tracking-tighter uppercase italic group-hover:text-hyper-cyan transition-colors truncate">{s.label}</div>
                                                    <div className="text-[7px] font-bold opacity-30 font-mono tracking-widest uppercase mt-0.5">READY</div>
                                                </div>
                                                <ChevronRight size={12} className={cn("hidden md:block transition-transform", currentSector === s.id ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0")} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Mini Vitals Terminal */}
                    <div className="flex-1 glass-v-series rounded-3xl p-8 flex flex-col gap-6 border border-white/5 bg-white/[0.01] overflow-hidden">
                        <div className="flex items-center justify-between font-mono">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Command_Feedback</span>
                            <Radar size={16} className="text-hyper-cyan animate-spin-slow opacity-40" />
                        </div>
                        <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                            {logs.map((log, i) => (
                                <div key={`${log.timestamp}-${i}`} className="flex gap-4 group">
                                    <div className={cn(
                                        "w-1 h-1 rounded-full mt-1.5 shrink-0 animate-pulse",
                                        log.type === 'system' ? "bg-hyper-cyan" : "bg-white/20"
                                    )} />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-white/30 uppercase font-mono tracking-[0.2em]">{log.type}_{log.timestamp}</span>
                                        <p className="text-[11px] font-bold text-white/60 leading-tight uppercase italic">{log.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleCommand} className="relative group">
                            <div className="absolute inset-0 bg-hyper-cyan/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 focus-within:border-hyper-cyan/40 transition-all">
                                <Search size={14} className="text-white/20 transition-colors group-focus-within:text-hyper-cyan" />
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="COMMAND_INPUT..."
                                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-white placeholder:text-white/10 w-full font-mono italic"
                                />
                            </div>
                        </form>
                    </div>
                </aside>

                {/* Main Workspace (Renderer) */}
                <main className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 glass-v-series rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent overflow-hidden flex flex-col">
                        <ModuleRenderer moduleId={currentSector} />
                    </div>
                </main>
            </div>

            {/* Global Status Footer */}
            <footer className="h-16 mt-8 px-10 glass-v-series rounded-2xl flex justify-between items-center border border-white/5 opacity-50 text-white/40">
                <div className="flex items-center gap-10 text-[9px] font-black tracking-[0.5em] uppercase font-mono italic">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>SYSTEM_STATUS: OPERATIONAL</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-hyper-cyan shadow-neon-cyan" />
                        <span>NEURAL_SYNC: ACTIVE</span>
                    </div>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <span className="text-[10px] font-black italic">ELITE_V-SERIES_BLUE_EDITION</span>
                </div>
            </footer>
        </motion.div>
    );
}
