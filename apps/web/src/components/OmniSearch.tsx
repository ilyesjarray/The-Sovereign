'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Cpu, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export function OmniSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => {
        setIsOpen(false);
        setQuery('');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    const results = [
        { category: 'Assets', items: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)'], icon: TrendingUp },
        { category: 'Bots', items: ['Grid Bot #1', 'Whale Hunter V2'], icon: Cpu },
        { category: 'Intelligence', items: ['Market Sentiment Report', 'Federal Reserve Impact Analysis'], icon: BookOpen },
    ].map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.toLowerCase().includes(query.toLowerCase()))
    })).filter(cat => cat.items.length > 0);

    const handleSelect = (item: string) => {
        handleClose();
        router.push('/global-ops');
    };

    return (
        <div className="font-mono">
            {/* Search Trigger */}
            <button
                onClick={handleOpen}
                className="hidden md:flex items-center gap-3 px-4 py-2 border border-white/5 hover:border-neon-blue/40 text-white/20 hover:text-neon-blue/60 transition-all w-64 text-left bg-black/40 group mb-10"
            >
                <Search className="w-4 h-4 group-hover:text-neon-blue transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">Search_OS (CMD+K)</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/90 backdrop-blur-xl"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="w-full max-w-2xl bg-black border border-neon-blue/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden rounded-none"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 p-6 border-b border-neon-blue/10 bg-white/5">
                                <Search className="w-5 h-5 text-neon-blue" />
                                <input
                                    autoFocus
                                    placeholder="TYPE_COMMAND_OR_QUERY..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-neon-blue text-xl placeholder:text-neon-blue/10 font-black tracking-widest uppercase italic"
                                />
                                <button onClick={handleClose} className="p-2 hover:bg-white/5 text-neon-blue/20 hover:text-neon-blue transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-10 custom-scrollbar">
                                {results.length > 0 ? (
                                    results.map((cat, i) => (
                                        <div key={i} className="space-y-4">
                                            <h4 className="text-[10px] text-neon-blue/40 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                                <cat.icon className="w-3.5 h-3.5" /> {cat.category}_INDEX
                                            </h4>
                                            <div className="grid gap-2">
                                                {cat.items.map((item, j) => (
                                                    <button
                                                        key={j}
                                                        onClick={() => handleSelect(item)}
                                                        className="flex items-center justify-between p-5 bg-black border border-neon-blue/5 hover:border-neon-blue/40 hover:bg-neon-blue/5 transition-all text-left group rounded-none"
                                                    >
                                                        <span className="text-xs text-neon-blue/60 group-hover:text-neon-blue transition-colors font-black uppercase tracking-widest italic">{item}</span>
                                                        <ArrowRight className="w-4 h-4 text-neon-blue/10 group-hover:text-neon-blue translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-6">
                                        <Search className="w-12 h-12 text-neon-blue/10 mx-auto animate-pulse" />
                                        <p className="text-neon-blue/20 italic font-black text-xs uppercase tracking-widest px-10">No matching signals found in the Sovereign network.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 border-t border-neon-blue/10 bg-white/5 flex justify-between items-center text-[9px] text-neon-blue/30 font-black uppercase tracking-widest">
                                <div className="flex gap-6">
                                    <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-black border border-neon-blue/20 text-neon-blue/60">ESC</kbd> CLOSE</span>
                                    <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-black border border-neon-blue/20 text-neon-blue/60">ENTER</kbd> EXECUTE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 bg-sovereign-blue animate-pulse shadow-[0_0_8px_#0074D9]" />
                                    EMPIRE_CORE_INDEX: ACTIVE
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
