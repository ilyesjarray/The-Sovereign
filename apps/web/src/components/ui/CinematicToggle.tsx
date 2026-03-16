'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Briefcase, Terminal } from 'lucide-react';

export function CinematicToggle() {
    const [theme, setTheme] = useState<'commander' | 'banking'>('commander');

    useEffect(() => {
        // Sync with body attribute
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'commander' ? 'banking' : 'commander');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${theme === 'commander'
                    ? 'bg-[#050A1F]/80 border-sovereign-accent-cyan/30 text-sovereign-accent-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'bg-white/80 border-slate-300 text-slate-800 shadow-xl'
                    }`}
            >
                <div className={`p-1 rounded-full ${theme === 'commander' ? 'bg-sovereign-accent-cyan/10' : 'bg-slate-200'}`}>
                    {theme === 'commander' ? <Terminal className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider font-mono hidden md:inline-block">
                    {theme === 'commander' ? 'Commander Mode' : 'Banking Mode'}
                </span>
            </motion.button>
        </div>
    );
}
