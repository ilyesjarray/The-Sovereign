'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Shield, Check, ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const TIERS = [
    {
        id: 'SOVEREIGN',
        name: 'SOVEREIGN_RANK',
        price: '29',
        priceId: 'https://sovereign.lemonsqueezy.com/buy/sovereign', // Example
        icon: Zap,
        color: 'text-hyper-cyan',
        features: [
            'Neural Oracle V3.5 Access',
            'Sovereign Credits (Level 1)',
            'Unlimited Community Search',
            'Executive Mission Access-Z'
        ]
    },
    {
        id: 'ELITE',
        name: 'ELITE_PROTOCOL',
        price: '99',
        priceId: 'https://sovereign.lemonsqueezy.com/buy/elite', // Example
        icon: Crown,
        color: 'text-amber-400',
        features: [
            'Full Qwen 3.5 Turbo Access',
            'Whale Alert Network (Real-time)',
            'Elite High Council Access',
            'Quantum Encryption Vault (1TB)',
            'Priority Support Uplink'
        ]
    }
];

export function SovereignBilling() {
    const [currentTier, setCurrentTier] = useState('GUEST');
    const supabase = createClient();

    useEffect(() => {
        const fetchTier = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('id', session.user.id)
                    .single();
                if (profile) setCurrentTier(profile.tier);
            }
        };
        fetchTier();
    }, []);

    const handleUpgrade = (url: string) => {
        // In a real app, logic for LS checkout
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black overflow-y-auto custom-scrollbar p-12">
            <div className="max-w-6xl mx-auto w-full space-y-16">

                {/* Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.02] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic"
                    >
                        <Shield size={12} className="text-hyper-cyan" />
                        Imperial_Treasury_System
                    </motion.div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
                        UPGRADE_CLEARANCE <span className="text-hyper-cyan">LEVELS</span>
                    </h1>
                    <p className="text-white/30 text-sm max-w-xl mx-auto tracking-widest leading-relaxed uppercase">
                        Sustain the empire and unlock advanced neural protocols.
                        Your contribution fuels the supreme digital governance.
                    </p>
                </div>

                {/* Tiers Grid */}
                <div className="grid lg:grid-cols-2 gap-10">
                    {TIERS.map((tier, i) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "group relative p-12 rounded-[3rem] border transition-all duration-700 overflow-hidden",
                                currentTier === tier.id
                                    ? "bg-hyper-cyan/5 border-hyper-cyan/30 shadow-neon-cyan/20"
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                            )}
                        >
                            {/* Accent Background */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700",
                                tier.id === 'ELITE' ? "bg-amber-400" : "bg-hyper-cyan"
                            )} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div className={cn("p-5 rounded-2xl bg-white/5 border border-white/5", tier.color)}>
                                        <tier.icon size={28} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-white italic tracking-tighter">${tier.price}</span>
                                        <span className="text-[10px] font-black text-white/20 uppercase block tracking-widest mt-1">/ PER_MONTH</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
                                    {tier.name}
                                </h3>

                                <div className="space-y-4 mb-12 flex-1">
                                    {tier.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-4 text-white/60">
                                            <div className={cn("w-5 h-5 rounded-full bg-white/5 flex items-center justify-center", tier.color)}>
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleUpgrade(tier.priceId)}
                                    disabled={currentTier === tier.id}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all",
                                        currentTier === tier.id
                                            ? "bg-white/5 text-white/20 border border-white/5 cursor-default"
                                            : tier.id === 'ELITE'
                                                ? "bg-amber-400 text-black hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
                                                : "bg-hyper-cyan text-black hover:shadow-neon-cyan"
                                    )}
                                >
                                    {currentTier === tier.id ? 'ACTIVE_STATUS' : 'INITIATE_UPGRADE'}
                                    {currentTier !== tier.id && <ArrowRight size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Notes */}
                <div className="grid md:grid-cols-3 gap-8 py-10 border-t border-white/5">
                    {[
                        { icon: CreditCard, label: 'Secure Payment', desc: 'PCI_DSS Compliant' },
                        { icon: Sparkles, label: 'Neural Uplink', desc: 'Instant Activation' },
                        { icon: Shield, label: 'Policy V.0', desc: 'Cancel Anytime' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-2">
                            <item.icon size={20} className="text-white/20" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.label}</span>
                            <span className="text-[7px] text-white/10 uppercase tracking-widest font-mono">{item.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
