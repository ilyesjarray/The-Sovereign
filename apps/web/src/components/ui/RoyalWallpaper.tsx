'use client';

import { motion } from 'framer-motion';

export function RoyalWallpaper() {
    return (
        <div className="fixed inset-0 -z-50 bg-black overflow-hidden pointer-events-none">
            {/* High Fidelity Technical Matrix Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #00F3FF 1px, transparent 1px), linear-gradient(to bottom, #00F3FF 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Deep Royal Atmospheric Bloom */}
            <motion.div
                animate={{
                    opacity: [0.05, 0.08, 0.05],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-1/4 -right-1/4 w-full h-full bg-deep-royal/20 blur-[250px] rounded-full"
            />

            {/* Neon Blue Atmospheric Bloom */}
            <motion.div
                animate={{
                    opacity: [0.03, 0.06, 0.03],
                    scale: [1, 1.15, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, delay: 5, ease: "easeInOut" }}
                className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-sovereign-blue/10 blur-[250px] rounded-full"
            />
        </div>
    );
}
