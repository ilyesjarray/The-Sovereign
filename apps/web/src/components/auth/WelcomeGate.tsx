'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface WelcomeGateProps {
    onInitialize: () => void;
}

export function WelcomeGate({ onInitialize }: WelcomeGateProps) {
    return (
        <div className="fixed inset-0 bg-[#000000] flex flex-col items-center justify-center overflow-hidden cursor-default">
            {/* Matte Black Grain Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            {/* Tactical HUD Corners */}
            <div className="absolute inset-10 border border-neon-blue/5 pointer-events-none">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-neon-blue/20" />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-neon-blue/20" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-neon-blue/20" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-neon-blue/20" />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Pulsing S Logo (neon-blue) */}
                <div className="relative mb-24">
                    {/* Radar Sweep Ring */}
                    <motion.div
                        animate={{ rotate: 360, opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-40px] border border-neon-blue/20 rounded-full"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-blue rounded-full shadow-[0_0_10px_#00F3FF]" />
                    </motion.div>

                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            filter: [
                                "drop-shadow(0 0 10px rgba(212, 175, 55, 0.2))",
                                "drop-shadow(0 0 30px rgba(212, 175, 55, 0.5))",
                                "drop-shadow(0 0 10px rgba(212, 175, 55, 0.2))"
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Shield className="w-40 h-40 text-[#00F3FF]" strokeWidth={1} />
                    </motion.div>
                </div>

                {/* Circular "INVOLVE SOVEREIGNTY" Button */}
                <div className="relative group">
                    {/* Radial Glow Expansion on Hover */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 group-hover:w-[600px] group-hover:h-[600px] bg-neon-blue/10 blur-[120px] rounded-full transition-all duration-700 ease-out pointer-events-none" />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onInitialize}
                        className="relative z-10 w-48 h-48 rounded-full border border-neon-blue/30 bg-black flex items-center justify-center group overflow-hidden shadow-[0_0_30px_rgba(0,0,0,1)]"
                    >
                        {/* High-frequency edge flicker on hover */}
                        <motion.div
                            className="absolute inset-0 border-2 border-neon-blue/0 group-hover:border-neon-blue/20 transition-colors duration-300"
                            animate={{ opacity: [0, 1, 0.5, 1, 0] }}
                            transition={{ duration: 0.2, repeat: Infinity }}
                        />

                        <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-[10px] font-black tracking-[0.4em] text-neon-blue group-hover:text-white transition-colors duration-500 text-center px-4 leading-relaxed relative z-20">
                            INVOLVE<br />SOVEREIGNTY
                        </span>

                        {/* Rotating Orbital Detail */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border-t border-neon-blue/20 rounded-full"
                        />
                    </motion.button>
                </div>
            </motion.div>

            {/* Bottom Status Ticker */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 flex gap-12 font-mono text-[8px] uppercase tracking-[0.6em] text-neon-blue bg-black/40 backdrop-blur-sm px-6 py-2 border border-neon-blue/10"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neon-blue animate-pulse" />
                    <span>PROTOCOL_v4.2.0</span>
                </div>
                <span>SYSTEM_READY_Ω</span>
            </motion.div>
        </div>
    );
}
