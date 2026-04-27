'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function UpdatingPage() {
    const [status, setStatus] = useState<'IDLE' | 'UPDATING' | 'SUCCESS'>('IDLE');
    const CURRENT_VERSION = 'v2.0.0-tier3'; // Must match SovereignSecurity.tsx

    const installUpdates = async () => {
        setStatus('UPDATING');

        try {
            // 1. Unregister Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
            }

            // 2. Clear Caches API
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) {
                    await caches.delete(key);
                }
            }

            // 3. Clear Storage
            localStorage.clear();
            sessionStorage.clear();

            // 4. Set new version
            localStorage.setItem('sovereign_version', CURRENT_VERSION);

            // 5. Redirect back to home
            setTimeout(() => {
                setStatus('SUCCESS');
                setTimeout(() => {
                    window.location.replace('/');
                }, 800);
            }, 1500);

        } catch (e) {
            console.error('Update failed:', e);
            // Fallback to just setting version and redirecting
            localStorage.setItem('sovereign_version', CURRENT_VERSION);
            window.location.replace('/');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white overflow-hidden font-mono relative">

            {/* Ambient Background Glow */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(0, 195, 255, 0.1) 0%, transparent 60%)' }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <div className="flex flex-col items-center text-center z-10 p-4">

                <motion.div
                    className="text-[#00c3ff] text-xl md:text-2xl tracking-[4px] mb-12 uppercase"
                    style={{ textShadow: '0 0 15px rgba(0, 195, 255, 0.5)' }}
                    animate={{
                        opacity: [0.8, 1, 0.8],
                        textShadow: [
                            '0 0 15px rgba(0, 195, 255, 0.5)',
                            '0 0 25px rgba(0, 195, 255, 0.8)',
                            '0 0 15px rgba(0, 195, 255, 0.5)'
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    SYSTEM UPDATE DETECTED
                </motion.div>

                <div className="relative flex items-center justify-center w-60 h-60 md:w-72 md:h-72">
                    {/* Spinning gradient border effect */}
                    <motion.div
                        className="absolute inset-[-10px] rounded-full opacity-50 z-0"
                        style={{ background: 'conic-gradient(from 0deg, transparent, rgba(0, 195, 255, 0.8), transparent)' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Inner black circle */}
                    <div className="absolute inset-[2px] rounded-full bg-black z-10" />

                    <button
                        onClick={installUpdates}
                        disabled={status !== 'IDLE'}
                        className={`
                            relative z-20 w-full h-full rounded-full bg-transparent 
                            border-2 border-[#00c3ff]/30 text-[#00c3ff] font-bold 
                            text-lg md:text-xl tracking-[4px] uppercase cursor-pointer
                            flex items-center justify-center transition-all duration-300
                            hover:scale-105 active:scale-95
                            shadow-[0_0_40px_rgba(0,195,255,0.15),inset_0_0_30px_rgba(0,195,255,0.1)]
                            hover:shadow-[0_0_80px_rgba(0,195,255,0.4),inset_0_0_50px_rgba(0,195,255,0.2)]
                            hover:border-[#00c3ff]/80
                            ${status !== 'IDLE' ? 'pointer-events-none border-[#00c3ff] shadow-[0_0_100px_rgba(0,195,255,0.6),inset_0_0_60px_rgba(0,195,255,0.4)]' : ''}
                        `}
                    >
                        <span className="text-center relative z-30 leading-relaxed">
                            {status === 'IDLE' && <>INSTALL<br /><br />UPDATES</>}
                            {status === 'UPDATING' && <>UPDATING<br /><br />...</>}
                            {status === 'SUCCESS' && <>SUCCESS</>}
                        </span>
                    </button>
                </div>

                <div className="mt-10 text-xs md:text-sm text-white/30 tracking-[2px] max-w-[320px] leading-relaxed">
                    This will clear your local cache and initialize the latest version of THE SOVEREIGN.
                </div>
            </div>
        </div>
    );
}
