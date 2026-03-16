'use client';

import { motion } from 'framer-motion';
import { AcquisitionHero } from '@/components/landing/AcquisitionHero';
import { RealityMetrics } from '@/components/landing/RealityMetrics';
import { IPComponents } from '@/components/landing/IPComponents';
import { DownloadDeck } from '@/components/landing/DownloadDeck';
import { ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AcquisitionPage() {
    return (
        <main className="min-h-screen bg-carbon-black selection:bg-hyper-cyan selection:text-carbon-black overflow-x-hidden">
            {/* Global Acquisition Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] p-10 flex justify-between items-center pointer-events-none">
                <Link
                    href="/dashboard"
                    className="pointer-events-auto flex items-center gap-4 px-8 py-4 glass-v-series rounded-2xl bg-white/[0.01] border border-white/5 hover:border-hyper-cyan/40 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.4em] italic transition-all group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    Return_To_Throne
                </Link>

                <div className="pointer-events-auto flex items-center gap-6 px-10 py-4 glass-v-series rounded-2xl bg-hyper-cyan/5 border border-hyper-cyan/20">
                    <ShieldAlert className="text-hyper-cyan w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] font-mono italic">
                        UPLINK: ENCRYPTED_ACQUISITION_CHANNEL
                    </span>
                </div>
            </nav>

            {/* Content Sections */}
            <div className="relative">
                <AcquisitionHero />
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <RealityMetrics />
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <IPComponents />
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <DownloadDeck />
            </div>

            {/* Custom Scroll Progress Bar */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-1 bg-hyper-cyan z-[101] origin-left shadow-neon-cyan"
                style={{ scaleX: 0 }} // This would normally use useScroll from framer-motion
                whileInView={{ scaleX: 1 }}
            />

            {/* Copyright / Footer */}
            <footer className="py-20 px-10 text-center border-t border-white/5 bg-carbon-black">
                <div className="max-w-7xl mx-auto space-y-6">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em] italic">
                        © 2026 Sovereign OS // All Rights Reserved // Exclusive IP Asset
                    </p>
                    <div className="flex justify-center gap-10">
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">Node: IDV-GLOBAL-01</span>
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">Protocol: V-SERIES_EXT</span>
                        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">Status: SECURE</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
