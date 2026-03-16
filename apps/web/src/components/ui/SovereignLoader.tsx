'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type LoaderVariant = 'sovereign-blue' | 'neon-blue' | 'obsidian';

interface SovereignLoaderProps {
    variant?: LoaderVariant;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    showDiamondDust?: boolean;
}

const variantColors: Record<LoaderVariant, { primary: string; glow: string; gradient: string }> = {
    'sovereign-blue': {
        primary: '#0074D9',
        glow: 'rgba(80, 200, 120, 0.4)',
        gradient: 'from-[#0074D9] to-[#2E8B57]',
    },
    'neon-blue': {
        primary: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.4)',
        gradient: 'from-[#00F3FF] to-[#B8860B]',
    },
    'obsidian': {
        primary: '#ffffff',
        glow: 'rgba(255, 255, 255, 0.1)',
        gradient: 'from-zinc-800 to-black',
    }
};

const sizeConfig = {
    sm: { spinner: 32, dust: 15 },
    md: { spinner: 48, dust: 25 },
    lg: { spinner: 64, dust: 35 },
};

export function SovereignLoader({
    variant = 'sovereign-blue',
    size = 'md',
    text,
    showDiamondDust = true,
}: SovereignLoaderProps) {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
    const colors = variantColors[variant];
    const dimensions = sizeConfig[size];

    useEffect(() => {
        if (showDiamondDust) {
            const particleCount = dimensions.dust;
            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
                delay: Math.random() * 2,
            }));
            setParticles(newParticles);
        }
    }, [showDiamondDust, dimensions.dust]);

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            {/* Diamond Dust Particles */}
            {showDiamondDust && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            className="absolute w-1.5 h-1.5 rounded-none"
                            style={{
                                background: colors.primary,
                                boxShadow: `0 0 4px ${colors.glow}`,
                                left: '50%',
                                top: '50%',
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: particle.x,
                                y: particle.y,
                            }}
                            transition={{
                                duration: 2,
                                delay: particle.delay,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Holographic Spinner */}
            <div className="relative" style={{ width: dimensions.spinner, height: dimensions.spinner }}>
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-t-transparent"
                    style={{
                        borderColor: colors.primary,
                        boxShadow: `0 0 20px ${colors.glow}`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Inner Ring */}
                <motion.div
                    className="absolute inset-2 rounded-full border-2 border-b-transparent opacity-60"
                    style={{
                        borderColor: colors.primary,
                    }}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Center Glow */}
                <motion.div
                    className="absolute inset-0 m-auto rounded-full"
                    style={{
                        width: dimensions.spinner / 3,
                        height: dimensions.spinner / 3,
                        background: `radial-gradient(circle, ${colors.primary}, transparent)`,
                        boxShadow: `0 0 30px ${colors.glow}`,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Loading Text */}
            {text && (
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p
                        className="text-sm font-mono uppercase tracking-widest"
                        style={{ color: colors.primary }}
                    >
                        {text}
                    </p>
                    <motion.div
                        className="flex justify-center gap-1 mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-none"
                                style={{ backgroundColor: colors.primary }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.6, 1.4, 0.6],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

// Preset variants for different tiers
export function GuestLoader(props: Omit<SovereignLoaderProps, 'variant'>) {
    return <SovereignLoader variant="sovereign-blue" {...props} />;
}

export function CommanderLoader(props: Omit<SovereignLoaderProps, 'variant'>) {
    return <SovereignLoader variant="sovereign-blue" {...props} />;
}

export function EliteLoader(props: Omit<SovereignLoaderProps, 'variant'>) {
    return <SovereignLoader variant="neon-blue" {...props} />;
}
