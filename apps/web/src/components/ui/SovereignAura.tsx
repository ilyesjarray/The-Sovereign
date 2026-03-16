'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function SovereignAura() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="fixed inset-0 bg-[#0A0C12] -z-50" />;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#0A0C12]">
            {/* Base Liquid Layer */}
            <div className="absolute inset-0 liquid-aura opacity-40" />

            {/* Cyan Ethereal Drift */}
            <motion.div
                animate={{
                    x: [-100, 100, 0],
                    y: [100, -100, 0],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#00F5FF]/10 blur-[180px] rounded-full"
            />

            {/* Deep Slate Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-0 bg-slate-900/40 blur-[100px]"
            />

            {/* Premium Grain Texture */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Radial Vignette (Focus Anchor) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,12,18,0.9)_100%)]" />
        </div>
    );
}
