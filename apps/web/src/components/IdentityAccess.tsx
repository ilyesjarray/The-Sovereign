'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Shield, LogOut, ChevronDown, CreditCard, Fingerprint, Zap } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface IdentityAccessProps {
    onSectorChange?: (sectorId: string) => void;
}

export function IdentityAccess({ onSectorChange }: IdentityAccessProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userTier, setUserTier] = useState<string>('GUEST');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);

                // Fetch Profile for Tier - Simplified Neydra Pattern
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('email', session.user.email)
                    .single();

                if (profile) setUserTier(profile.tier);
            }
        };

        fetchUserData();

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = userEmail ? userEmail.split('@')[0] : 'GUEST';

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
        router.push('/');
        router.refresh();
    };

    const menuItems = [
        { label: 'Security Clearance', icon: Shield, href: '#', desc: 'Manage access levels', id: 'sovereign-vault', menuKey: 'security-clearance' },
        { label: 'Treasury & Billing', icon: CreditCard, href: '#', desc: 'Subscription status', id: 'imperial-billing', menuKey: 'treasury-billing' },
        { label: 'System Config', icon: Settings, href: '#', desc: 'OS Preferences', id: 'system-settings', menuKey: 'system-config' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-hyper-cyan/30 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-hyper-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="w-8 h-8 rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center relative z-10 overflow-hidden">
                    <Fingerprint className="w-5 h-5 text-hyper-cyan group-hover:scale-110 transition-transform" />
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-hyper-cyan animate-pulse" />
                </div>

                <div className="hidden lg:flex flex-col items-start relative z-10 text-left">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none truncate max-w-[80px]">
                        {displayName}
                    </span>
                    <span className={cn(
                        "text-[8px] font-bold uppercase tracking-tighter leading-none mt-1",
                        userTier === 'EMPIRE' ? "text-blue-400" : userTier === 'SOVEREIGN' ? "text-hyper-cyan" : userTier === 'ELITE' ? "text-white/80" : "text-white/40"
                    )}>
                        {userTier} ACCESS
                    </span>
                </div>

                <ChevronDown
                    className="w-3.5 h-3.5 text-white/20 transition-transform duration-300 group-hover:text-hyper-cyan"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute top-full mt-4 right-0 w-72 glass-v-series border border-white/10 z-[110] shadow-premium rounded-2xl overflow-hidden"
                    >
                        {/* Header: User Profile Segment */}
                        <div className="px-6 py-6 border-b border-white/5 bg-gradient-to-br from-hyper-cyan/5 to-transparent">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-hyper-cyan/20 border border-hyper-cyan/40 flex items-center justify-center shadow-neon-cyan">
                                    <User className="w-6 h-6 text-hyper-cyan" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-black text-white tracking-widest uppercase truncate">
                                        {displayName}
                                    </span>
                                    <span className="text-[10px] text-white/40 truncate">{userEmail || 'Verification Pending'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-hyper-cyan/10 border border-hyper-cyan/20">
                                <Zap className="w-3 h-3 text-hyper-cyan" />
                                <span className="text-[9px] font-black text-hyper-cyan uppercase tracking-widest">Empire Tier Active</span>
                            </div>
                        </div>

                        <div className="p-3 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.menuKey}
                                    className="w-full"
                                    onClick={() => {
                                        onSectorChange?.(item.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-hyper-cyan group-hover:bg-hyper-cyan/10 transition-colors">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black text-white/60 group-hover:text-white uppercase tracking-widest transition-colors">
                                                {item.label}
                                            </span>
                                            <span className="text-[8px] text-white/20 uppercase tracking-wider">{item.desc}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Action Segment */}
                        <div className="p-3 border-t border-white/5 bg-white/2">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-blue-500/60 hover:text-blue-500 hover:bg-blue-500/10 transition-all group font-black uppercase tracking-[0.2em] text-[10px]"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Link</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

