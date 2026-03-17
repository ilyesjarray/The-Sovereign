// @ts-nocheck
'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

export type UserTier = 'CITIZEN' | 'PREMIUM' | 'ULTRA' | 'GUEST';

interface FeatureGateProps {
    children: ReactNode;
    feature: string;
    className?: string;
    fallback?: ReactNode;
}

// Simplified Access Mapping (Neydra Style)
const tierAccess: Record<UserTier, string[]> = {
    'ULTRA': ['ALL'],
    'PREMIUM': ['NEURAL_ORACLE_ADVANCED', 'WHALE_ALERTS', 'PREMIUM_FEEDS', 'QUANTUM_VAULT'],
    'CITIZEN': ['NEURAL_ORACLE_BASIC', 'SOVEREIGN_CREDITS', 'SECTOR_ACCESS'],
    'GUEST': []
};

function canAccess(feature: string, tier: UserTier): boolean {
    if (tier === 'ULTRA') return true;
    const allowed = tierAccess[tier] || [];
    return allowed.includes('ALL') || allowed.includes(feature);
}

export function FeatureGate({ children, feature, className, fallback }: FeatureGateProps): any {
    const [tier, setTier] = useState<UserTier>('GUEST');
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchTier = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('email', session.user.email)
                    .single();
                
                if (profile) setTier(profile.tier as UserTier);
            }
            setIsLoading(false);
        };
        fetchTier();
    }, []);

    const hasAccess = canAccess(feature, tier);

    if (isLoading) {
        return <div className="animate-pulse bg-white/5 rounded-xl h-48 w-full" />;
    }

    if (hasAccess) {
        return <div className={className}>{children as any}</div>;
    }

    if (fallback) return <>{fallback}</>;

    return (
        <div className={cn("relative group overflow-hidden rounded-xl", className)}>
            {/* Blurred Content Teaser */}
            <div className="filter blur-xl opacity-30 select-none pointer-events-none">
                {children as any}
            </div>

            {/* Upgrade Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xs w-full glass-panel p-6 rounded-2xl border-sovereign-accent-gold/30 text-center shadow-2xl relative"
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-sovereign-accent-gold/10 blur-2xl rounded-full" />

                    <div className="relative z-10 space-y-4">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-sovereign-accent-gold/10 border border-sovereign-accent-gold/30 flex items-center justify-center text-sovereign-accent-gold">
                                <Lock className="w-6 h-6" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Locked Feature</h4>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">
                                Access to <span className="text-sovereign-accent-gold">{feature.replace(/_/g, ' ')}</span> is reserved for PRO & ELITE Commanders.
                            </p>
                        </div>

                        <Link href="/pricing" className="block">
                            <button className="w-full py-2 bg-sovereign-accent-gold text-black text-[10px] font-bold rounded-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                                UNLOCK SOVEREIGN POWER
                                <Sparkles className="w-3 h-3" />
                            </button>
                        </Link>

                        <div className="flex items-center justify-center gap-2 opacity-30">
                            <ShieldCheck className="w-3 h-3" />
                            <span className="text-[8px] uppercase font-mono">Institutional Gating Active</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
