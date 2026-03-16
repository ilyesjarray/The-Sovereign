'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGS = [
    "ENCRYPTING_NODES_Ω",
    "SYNCING_NEYDRA_PROXIES...",
    "BYPASSING_TRADITIONAL_PROTOCOLS...",
    "ESTABLISHING_ZULU_RELAY...",
    "NEURAL_LINK_STABILIZED",
    "DECRYPTING_ASSET_VAULT_IX",
];

interface CinematicLoadingProps {
    onComplete: () => void;
}

export function CinematicLoading({ onComplete }: CinematicLoadingProps) {
    const [progress, setProgress] = useState(0);
    const audioRefSub = useRef<HTMLAudioElement | null>(null);
    const audioRefWhir = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Audio Triggers with absolute paths/reliable previews
        const playSounds = async () => {
            try {
                // Sub-bass impact (Deep cinematic boom)
                const sub = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                sub.volume = 0.8;
                sub.play();
                audioRefSub.current = sub;

                // Mechanical Whirring (High tech hum)
                const whir = new Audio('https://assets.mixkit.co/active_storage/sfx/135/135-preview.mp3');
                whir.loop = true;
                whir.volume = 0.3;
                whir.play();
                audioRefWhir.current = whir;
            } catch (e) {
                console.log('Audio blocked or failed');
            }
        };
        playSounds();

        // Loading Logic - Accelerated start, steady middle, snap finish
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    // Success "Ding" + Data Flutter
                    const ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
                    ding.volume = 0.6;
                    ding.play();

                    const hiss = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');
                    hiss.volume = 0.3;
                    hiss.play();

                    if (audioRefWhir.current) audioRefWhir.current.pause();
                    setTimeout(onComplete, 1200);
                    return 100;
                }
                const increment = p < 20 ? 4 : p > 80 ? 3 : 1;
                return Math.min(p + increment, 100);
            });
        }, 60);

        return () => {
            clearInterval(interval);
            if (audioRefWhir.current) audioRefWhir.current.pause();
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[1000] flex items-center justify-center overflow-hidden">
            {/* Layered Technical Explosion */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Fast thin lines */}
                {[...Array(32)].map((_, i) => (
                    <motion.div
                        key={`fast-${i}`}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: ['0%', '180%'],
                            opacity: [0, 0.4, 0],
                            rotate: i * 11.25
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.02, ease: "easeOut" }}
                        className="absolute h-[0.5px] bg-neon-blue/40 origin-left"
                    />
                ))}
                {/* Slow thick glowing lines */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={`slow-${i}`}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: ['0%', '140%'],
                            opacity: [0, 0.2, 0],
                            rotate: i * 30
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        className="absolute h-[2px] bg-gradient-to-r from-neon-blue to-transparent origin-left blur-[1px]"
                    />
                ))}
            </div>

            {/* Central Energy Flare */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                    filter: ["blur(40px)", "blur(80px)", "blur(40px)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-96 h-96 bg-neon-blue/20 rounded-full z-0"
            />

            <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center">
                {/* 3D Layer Stacking Visual (HUD Assembly) */}
                <div className="relative w-64 h-64 mb-16 perspective-[1000px]">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 0, opacity: 0, scale: 0.8 }}
                            animate={{
                                y: -i * 25,
                                opacity: 0.1 + (i * 0.15),
                                scale: 1 + (i * 0.08),
                                rotateZ: i * 5,
                            }}
                            className="absolute inset-0 border-[0.5px] border-neon-blue/40 rounded-none transform-gpu shadow-[inset_0_0_20px_rgba(212,175,55,0.1)]"
                            style={{
                                rotateX: '65deg',
                            }}
                        />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                textShadow: ["0 0 10px #00F3FF", "0 0 30px #00F3FF", "0 0 10px #00F3FF"]
                            }}
                            transition={{ duration: 0.15, repeat: Infinity }}
                            className="text-neon-blue font-black text-5xl italic tracking-tighter"
                        >
                            {progress}%
                        </motion.div>
                    </div>
                </div>

                {/* Matrix-style Data Feed */}
                <div className="w-full text-left font-mono text-[9px] h-32 overflow-hidden bg-black/80 border border-neon-blue/20 p-5 space-y-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    <AnimatePresence>
                        {LOGS.map((log, i) => (
                            progress > (i * 15) && (
                                <motion.div
                                    key={log}
                                    initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    className={i % 2 === 0 ? "text-neon-blue" : "text-sovereign-blue"}
                                >
                                    <span className="opacity-30 inline-block w-24 tracking-[0.2em]">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                    <span className="font-bold tracking-widest">{log}</span>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>
                    <div className="text-white/10 animate-pulse mt-2 tracking-[0.5em]">__LISTENING_FOR_COMMAND_SIGNAL...</div>
                </div>

                {/* HUD Loading Bar */}
                <div className="w-full mt-8 h-[2px] bg-white/5 relative overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-neon-blue shadow-[0_0_20px_#00F3FF]"
                        animate={{ width: `${progress}%` }}
                    />
                    {/* Ghost bar pursuit */}
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-neon-blue/20"
                        animate={{ width: `${progress + 5}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Scan Line Detail */}
            <motion.div
                animate={{ top: ['-20%', '120%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-[20px] bg-gradient-to-b from-transparent via-neon-blue/10 to-transparent z-50 pointer-events-none"
            />
        </div>
    );
}
