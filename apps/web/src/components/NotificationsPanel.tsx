'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'Arbitrage Opportunity',
        message: 'BTC/USDT spread on Binance vs Coinbase reached 1.2%.',
        type: 'info',
        time: '2m ago',
    },
    {
        id: '2',
        title: 'Security Alert',
        message: 'New login detected from a new IP: 192.168.1.1.',
        type: 'warning',
        time: '15m ago',
    },
    {
        id: '3',
        title: 'Bot Deployed',
        message: 'Grid Trading Bot #42 is now active on ETH/USDT.',
        type: 'success',
        time: '1h ago',
    },
];

export function NotificationsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative font-mono" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-black border border-neon-blue/20 text-neon-blue/40 hover:text-neon-blue hover:border-neon-blue/40 transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)] group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-blue animate-pulse shadow-[0_0_8px_#00F3FF]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                        className="absolute top-full mt-4 right-0 w-80 sm:w-[400px] bg-black/95 backdrop-blur-3xl border border-neon-blue/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100] rounded-none"
                    >
                        <div className="p-5 border-b border-neon-blue/10 flex justify-between items-center bg-black/40">
                            <h3 className="font-black text-neon-blue uppercase tracking-[0.3em] text-[11px] italic underline decoration-neon-blue/10">Tactical_Alerts_Stream</h3>
                            <button onClick={() => setIsOpen(false)} className="text-neon-blue/20 hover:text-neon-blue transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-black/20">
                            {NOTIFICATIONS.length > 0 ? (
                                <div className="divide-y divide-neon-blue/5">
                                    {NOTIFICATIONS.map((n) => (
                                        <div key={n.id} className="p-5 hover:bg-neon-blue/5 transition-all cursor-pointer group relative overflow-hidden">
                                            <div className="absolute left-0 top-0 w-0.5 h-full bg-neon-blue/0 group-hover:bg-neon-blue transition-all" />
                                            <div className="flex gap-4">
                                                <div className="mt-1">
                                                    {n.type === 'info' && <Info className="w-4 h-4 text-neon-blue shadow-[0_0_8px_rgba(212,175,55,0.3)]" />}
                                                    {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-rose-500 shadow-[0_0_8px_rgba(224,82,82,0.3)]" />}
                                                    {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-sovereign-blue shadow-[0_0_8px_rgba(80,200,120,0.3)]" />}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-neon-blue/90 uppercase tracking-widest group-hover:text-neon-blue transition-colors italic">{n.title}</span>
                                                        <span className="text-[9px] text-neon-blue/30 font-black uppercase tracking-widest">{n.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-neon-blue/40 leading-relaxed font-black uppercase tracking-tight italic group-hover:text-neon-blue/70 transition-colors">&gt; {n.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-neon-blue/10 text-xs font-black uppercase tracking-[0.5em] italic">
                                    No tactical alerts detected
                                </div>
                            )}
                        </div>

                        <div className="p-4 text-center border-t border-neon-blue/10 bg-black/40">
                            <button className="text-[9px] text-neon-blue/40 font-black uppercase tracking-[0.4em] hover:text-neon-blue transition-all shadow-none hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] py-2 w-full border border-transparent hover:border-neon-blue/20 italic">
                                VIEW_FULL_INTEL_LOGS
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
