'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function NetWorthCounter({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value);
    const springValue = useSpring(value, { stiffness: 100, damping: 30 });
    const formatted = useTransform(springValue, (latest) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(latest)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            // High-speed millisecond fluctuations
            const fluctuation = (Math.random() - 0.45) * 50;
            setDisplayValue(prev => prev + fluctuation);
        }, 150); // Sub-second ticking
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        springValue.set(displayValue);
    }, [displayValue, springValue]);

    return (
        <div className="flex flex-col">
            <motion.span className="text-neon-blue text-5xl font-black tracking-tighter filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] italic">
                {formatted}
            </motion.span>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 bg-sovereign-blue rounded-full animate-ping" />
                <span className="text-[10px] text-sovereign-blue/60 font-mono tracking-[0.3em] uppercase">LIQUIDITY_FLOW_STREAM_LIVE</span>
            </div>
        </div>
    );
}
