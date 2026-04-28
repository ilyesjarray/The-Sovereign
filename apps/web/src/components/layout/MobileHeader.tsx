'use client';

import { motion } from 'framer-motion';
import { Shield, Activity, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { IdentityAccess } from '@/components/IdentityAccess';

interface MobileHeaderProps {
    onMenuToggle: () => void;
    isMenuOpen: boolean;
    onSectorChange: (id: string) => void;
}

export function MobileHeader({ onMenuToggle, isMenuOpen, onSectorChange }: MobileHeaderProps) {
    return (
        <motion.header
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-black/90 backdrop-blur-2xl border-b border-white/10 safe-area-top"
        >
            <div className="flex items-center justify-between h-14 px-4">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-600/30 overflow-hidden">
                        <Image src="/assets/icon.png" alt="Sovereign" width={28} height={28} className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tighter uppercase italic text-white flex gap-1">
                            Sovereign <span className="text-hyper-cyan">OS</span>
                        </h1>
                        <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-white/30">
                            <Shield size={8} className="text-hyper-cyan" />
                            <span>MOBILE_COMMAND</span>
                        </div>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <Activity size={14} className="text-hyper-cyan" />
                    </div>
                    <IdentityAccess onSectorChange={onSectorChange} />
                    <button
                        onClick={onMenuToggle}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40"
                    >
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>
        </motion.header>
    );
}
