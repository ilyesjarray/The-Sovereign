'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Lock } from 'lucide-react';

interface BiometricLoginProps {
    onSuccess: () => void;
}

export function BiometricLogin({ onSuccess }: BiometricLoginProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [glitchActive, setGlitchActive] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate scan sequence
        setTimeout(() => {
            setScanComplete(true);
            setGlitchActive(true);

            const ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
            ding.volume = 0.5;
            ding.play();

            // Tactical Hiss
            const hiss = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');
            hiss.volume = 0.2;
            hiss.play();

            setTimeout(() => setGlitchActive(false), 300);
            setTimeout(onSuccess, 1500);
        }, 3000);
    };

    return (
        <div className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black ${glitchActive ? 'animate-pulse scale-[1.02]' : ''}`}>
            {/* Blurred War Room Background Preview */}
            <div className="absolute inset-0 z-0 bg-black/90 backdrop-blur-[60px] opacity-60" />

            {/* Dynamic HUD Lines */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-neon-blue" />
                <div className="absolute bottom-1/4 left-0 right-0 h-[1px] bg-neon-blue" />
            </div>

            {/* Scanner Interface */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-12 flex flex-col items-center border border-neon-blue/10 bg-black/60 shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-blue/40" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-blue/40" />

                <div className="mb-12 text-center">
                    <motion.div
                        animate={isScanning ? { opacity: [0.4, 1, 0.4] } : {}}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block p-5 bg-neon-blue/5 border border-neon-blue/30 mb-8"
                    >
                        <Lock className="w-10 h-10 text-neon-blue" />
                    </motion.div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2 leading-none">
                        BIOMETRIC_HANDSHAKE
                    </h2>
                    <p className="text-[10px] font-mono tracking-[0.5em] text-neon-blue/40 uppercase">
                        AUTHORIZATION_ZULU_LEVEL_IX
                    </p>
                </div>

                {/* Fingerprint / Scanning Box */}
                <div
                    className="relative w-56 h-72 border border-neon-blue/20 bg-black/80 flex items-center justify-center group overflow-hidden cursor-pointer shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
                    onClick={!isScanning ? handleScan : undefined}
                >
                    {/* Tactical Readouts around the box */}
                    <div className="absolute top-2 left-2 text-[6px] font-mono text-neon-blue/20 flex flex-col gap-1">
                        <span>SCAN_RES: 8K_DYNAMIC</span>
                        <span>DEPTH: PHASE_SHIFT</span>
                    </div>

                    <Fingerprint className={`w-36 h-36 transition-all duration-700 ${isScanning ? 'text-neon-blue scale-110 drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]' : 'text-neon-blue/10 group-hover:text-neon-blue/30'}`} />

                    {/* Laser Scanning Line */}
                    {isScanning && !scanComplete && (
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            className="absolute left-0 right-0 h-[2px] bg-neon-blue shadow-[0_0_20px_#00F3FF] z-10"
                        />
                    )}

                    {/* Scan Success Overlay */}
                    <AnimatePresence>
                        {scanComplete && (
                            <motion.div
                                initial={{ opacity: 0, scale: 1.2 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-sovereign-blue/10 flex items-center justify-center flex-col gap-8 z-20 backdrop-blur-md"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        boxShadow: ["0 0 20px #0074D9", "0 0 50px #0074D9", "0 0 20px #0074D9"]
                                    }}
                                    className="w-24 h-24 rounded-none border-4 border-sovereign-blue flex items-center justify-center bg-black"
                                >
                                    <Shield className="w-12 h-12 text-sovereign-blue" />
                                </motion.div>
                                <div className="text-center">
                                    <span className="text-[11px] font-black text-sovereign-blue tracking-[0.6em] uppercase block mb-2">ACCESS_GRANTED</span>
                                    <span className="text-[8px] font-mono text-white/40 tracking-widest block uppercase italic">COMMAND_CENTER_REDIRECTING...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isScanning && (
                        <div className="absolute bottom-8 text-[9px] font-black text-neon-blue/30 tracking-[0.4em] animate-pulse uppercase italic">
                            VERIFY_CELL_CAPACITANCE
                        </div>
                    )}
                </div>

                {/* Footer Readouts */}
                <div className="mt-14 w-full flex justify-between font-mono text-[7px] text-white/10 uppercase tracking-[0.4em]">
                    <div className="flex flex-col gap-1">
                        <span>NODE_ID: IX-7742</span>
                        <span>IP_ADDR: [HIDDEN]</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span>AUTH_SIG: SHA-512</span>
                        <span>LINK: STABLE</span>
                    </div>
                </div>
            </motion.div>

            {/* Background Atmosphere Lights */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-blue/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-sovereign-blue/5 blur-[160px] rounded-full pointer-events-none" />
        </div>
    );
}
