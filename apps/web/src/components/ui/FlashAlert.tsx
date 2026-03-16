'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlashAlertProps {
    value: number;
    className?: string;
    children: React.ReactNode;
}

export function FlashAlert({ value, className, children }: FlashAlertProps) {
    const [prevValue, setPrevValue] = useState(value);
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);

    useEffect(() => {
        if (value > prevValue) {
            setFlash('up');
            const timer = setTimeout(() => setFlash(null), 1000);
            setPrevValue(value);
            return () => clearTimeout(timer);
        } else if (value < prevValue) {
            setFlash('down');
            const timer = setTimeout(() => setFlash(null), 1000);
            setPrevValue(value);
            return () => clearTimeout(timer);
        }
    }, [value, prevValue]);

    return (
        <div className={cn('relative inline-block transition-colors duration-300', className)}>
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            'absolute inset-0 rounded-none pointer-events-none',
                            flash === 'up' ? 'bg-sovereign-blue border border-sovereign-blue/50' : 'bg-rose-500 border border-rose-500/50'
                        )}
                        style={{ filter: 'blur(8px)' }}
                    />
                )}
            </AnimatePresence>
            <span className={cn(
                'relative z-10 transition-colors duration-500 font-black italic',
                flash === 'up' ? 'text-sovereign-blue shadow-glow-emerald' : flash === 'down' ? 'text-rose-500 shadow-glow-red' : ''
            )}>
                {children}
            </span>
        </div>
    );
}
