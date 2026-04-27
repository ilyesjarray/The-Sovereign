'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MobileHeader } from './MobileHeader';
import { MobileNav, ALL_MOBILE_SECTORS } from './MobileNav';
import { ModuleRenderer } from '@/components/modules/ModuleRenderer';
import { useSound } from '@/providers/SoundProvider';
import { NeuralBriefing } from '@/components/modules/NeuralBriefing';

interface MobileLayoutProps {
    showBriefing: boolean;
    setShowBriefing: (v: boolean) => void;
}

export function MobileLayout({ showBriefing, setShowBriefing }: MobileLayoutProps) {
    const { playClick } = useSound();
    const [currentSector, setCurrentSector] = useState('market-oracle');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExpandedMenu, setIsExpandedMenu] = useState(false);

    const handleSectorChange = (id: string) => {
        playClick();
        setCurrentSector(id);
        setIsMenuOpen(false);
        setIsExpandedMenu(false);
    };

    return (
        <div className="min-h-screen bg-carbon-black text-hyper-cyan font-sans relative flex flex-col">
            {/* Mobile Header */}
            <MobileHeader
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                isMenuOpen={isMenuOpen}
                onSectorChange={handleSectorChange}
            />

            {/* Neural Briefing */}
            <AnimatePresence>
                {showBriefing && (
                    <NeuralBriefing onClose={() => setShowBriefing(false)} />
                )}
            </AnimatePresence>

            {/* Full Sector Menu Overlay */}
            <AnimatePresence>
                {(isMenuOpen || isExpandedMenu) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl pt-14 pb-20 overflow-y-auto"
                    >
                        <div className="p-4 space-y-6">
                            <div className="text-center pt-4 pb-2">
                                <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">
                                    Sovereign Sectors
                                </h2>
                                <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-mono mt-1">
                                    Select command center
                                </p>
                            </div>

                            {ALL_MOBILE_SECTORS.map((group) => (
                                <div key={group.group} className="space-y-2">
                                    <div className="flex items-center gap-3 px-2">
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-[8px] font-black text-hyper-cyan/40 uppercase tracking-[0.3em]">
                                            {group.group}
                                        </span>
                                        <div className="h-px w-4 bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {group.sectors.map((sector) => (
                                            <button
                                                key={sector.id}
                                                onClick={() => handleSectorChange(sector.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                                    currentSector === sector.id
                                                        ? "bg-hyper-cyan/10 border-hyper-cyan/30 text-white"
                                                        : "bg-white/[0.02] border-white/5 text-white/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    currentSector === sector.id
                                                        ? "bg-hyper-cyan text-carbon-black"
                                                        : "bg-white/5"
                                                )}>
                                                    <sector.icon size={14} />
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-tight truncate">
                                                    {sector.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 pt-14 pb-16 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <ModuleRenderer moduleId={currentSector} />
                </div>
            </main>

            {/* Bottom Navigation */}
            <MobileNav
                currentSector={currentSector}
                onSectorChange={handleSectorChange}
                onExpandMenu={() => setIsExpandedMenu(!isExpandedMenu)}
            />
        </div>
    );
}
