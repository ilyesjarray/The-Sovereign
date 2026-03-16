'use client';

import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { useOracleStore } from '@/store/oracle-store';

export function NeuralPulse() {
    const { marketData } = useMarketData();
    const primaryCoin = marketData?.topCoins[0];

    // Mouse Interaction
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth trailing physics
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = (clientX - window.innerWidth / 2) * 0.1;
            const moveY = (clientY - window.innerHeight / 2) * 0.1;
            mouseX.set(moveX);
            mouseY.set(moveY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Volume-Link Pulsation
    const volumeFactor = primaryCoin?.total_volume ? Math.min(primaryCoin.total_volume / 100000000000, 1) : 0.2;
    const { volatilityAlert } = useOracleStore();

    return (
        <div className="relative w-4 h-4 flex items-center justify-center">
            {/* Predictive Heatwave (High-Frequency Flicker) */}
            <AnimatePresence>
                {volatilityAlert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.2, 0.8, 0.4, 1, 0.3],
                            scale: [1, 1.1, 0.95, 1.05, 1],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute w-12 h-12 bg-orange-500/20 blur-[20px] rounded-full z-0"
                    />
                )}
            </AnimatePresence>
            {/* The Ethereal Core (Refined Focus) */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.9, 1, 0.9]
                }}
                transition={{
                    duration: 4 - (volumeFactor * 2),
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute w-8 h-8 z-20 pointer-events-none"
                style={{
                    x: springX,
                    y: springY,
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0) 100%)',
                    filter: 'blur(2px) drop-shadow(0 0 10px rgba(255,255,255,0.5))'
                }}
            />

            {/* Cyan Bloom (Diffusion) */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute w-64 h-64 bg-[#00F5FF]/5 blur-[80px] rounded-full pointer-events-none z-10"
            />

            {/* White Aura (High Fidelity) */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute w-24 h-24 bg-white/10 blur-[40px] rounded-full pointer-events-none z-10"
            />

            {/* Larger Subtle Pulse */}
            <motion.div
                style={{ x: springX, y: springY }}
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.03, 0.08, 0.03]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none"
            />
        </div>
    );
}
