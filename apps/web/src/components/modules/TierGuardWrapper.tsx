'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface TierGuardWrapperProps {
    children: React.ReactNode;
    sectorName: string;
    requiredTier: 'STANDARD' | 'PREMIUM' | 'ULTRA';
}

const TIER_WEIGHTS: Record<string, number> = {
    'GUEST': 0,
    'STANDARD': 1,
    'PRO': 1,
    'PREMIUM': 2,
    'MEDIUM': 2,
    'ULTRA': 3,
    'ELITE': 3
};

export function TierGuardWrapper({ children, sectorName, requiredTier }: TierGuardWrapperProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [readOnlyMode, setReadOnlyMode] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsAuthorized(false);
                setShowPopup(true);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('tier')
                .eq('id', session.user.id)
                .single();

            const userTier = profile?.tier?.toUpperCase() || 'GUEST';
            const userWeight = TIER_WEIGHTS[userTier] || 0;
            const requiredWeight = TIER_WEIGHTS[requiredTier] || 0;

            if (userWeight >= requiredWeight) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                setShowPopup(true);
            }
        };

        checkAccess();
    }, [requiredTier]);

    const handleUpgrade = () => {
        // Dispatch event to go to billing
        window.dispatchEvent(new CustomEvent('sovereign-command', { detail: { command: 'billing' } }));
    };

    const handleExplore = () => {
        setShowPopup(false);
        setReadOnlyMode(true);
    };

    if (isAuthorized === null) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Zap className="text-hyper-cyan animate-pulse" size={24} />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-carbon-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ y: 20, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 20, scale: 0.95, opacity: 0 }}
                            className="bg-carbon-black border border-rose-500/30 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden"
                        >
                            {/* Background visual flair */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <Lock size={150} className="text-rose-500" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                        <ShieldAlert className="text-rose-500" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Upgrade_Required</h3>
                                        <p className="text-[10px] text-rose-500/80 uppercase tracking-widest font-mono mt-1">Sector_Locked: {sectorName}</p>
                                    </div>
                                </div>
                                
                                <p className="text-white/60 text-sm leading-relaxed font-medium">
                                    Commander, your current clearance level is insufficient to engage with the <span className="text-hyper-cyan font-bold">{sectorName}</span> subsystem. A <span className="text-rose-400 font-bold">{requiredTier}</span> tier subscription is required.
                                </p>

                                <div className="flex flex-col gap-3 mt-4">
                                    <button
                                        onClick={handleUpgrade}
                                        className="w-full py-5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                                    >
                                        <Zap size={16} /> Authenticate_Upgrade
                                    </button>
                                    
                                    <button
                                        onClick={handleExplore}
                                        className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3"
                                    >
                                        <Eye size={16} /> Explore_As_Guest
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                "w-full h-full transition-all duration-1000",
                readOnlyMode && "pointer-events-none select-none grayscale-[0.3] opacity-60 relative"
            )}>
                {/* Visual indicator overlay when in read-only mode */}
                {readOnlyMode && (
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-rose-500/20 to-transparent flex items-center justify-center z-40 pointer-events-none">
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.5em] animate-pulse drop-shadow-md">
                            READ_ONLY_MODE_ACTIVE // NO_AUTHORIZATION
                        </span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
