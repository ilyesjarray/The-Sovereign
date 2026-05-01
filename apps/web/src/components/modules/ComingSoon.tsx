'use client';

import { motion } from 'framer-motion';
import { Hammer, Construction, Zap, ShieldAlert, Cpu, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonProps {
    sectorName: string;
}

export function ComingSoon({ sectorName }: ComingSoonProps) {
    return (
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-carbon-black p-10 font-sans">
            {/* Background Neural Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="grid grid-cols-12 h-full w-full border-white/5 border-l border-t">
                    {[...Array(144)].map((_, i) => (
                        <div key={i} className="border-r border-b border-white/5 h-24 w-full" />
                    ))}
                </div>
            </div>

            {/* Glowing Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hyper-cyan/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
                {/* Construction Hexagon */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="w-48 h-48 border-2 border-hyper-cyan/20 rounded-[2.5rem] flex items-center justify-center relative"
                    >
                        <div className="absolute inset-0 border-t-2 border-hyper-cyan rounded-[2.5rem] animate-spin-slow opacity-60 shadow-neon-cyan" />
                        <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Hammer size={64} className="text-hyper-cyan" />
                        </motion.div>
                    </motion.div>
                    
                    {/* Floating Tech Elements */}
                    <motion.div
                        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute -top-4 -right-4 p-3 bg-carbon-black border border-white/10 rounded-xl shadow-2xl"
                    >
                        <Cpu size={20} className="text-hyper-cyan/40" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        className="absolute -bottom-4 -left-4 p-3 bg-carbon-black border border-white/10 rounded-xl shadow-2xl"
                    >
                        <Zap size={20} className="text-amber-400/40" />
                    </motion.div>
                </div>

                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-hyper-cyan/10 border border-hyper-cyan/20 rounded-full">
                        <span className="w-2 h-2 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                        <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.4em] font-mono">Construction_Protocol_Active</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
                            {sectorName.replace(/-/g, '_')}
                        </h2>
                        <p className="text-xl font-black text-white/40 uppercase tracking-[0.2em] italic">SECTOR_UNDER_CONSTRUCTION</p>
                    </div>

                    <p className="text-sm text-white/20 uppercase tracking-widest leading-relaxed max-w-lg mx-auto font-mono">
                        Our neural engineering team is currently assembling the <span className="text-hyper-cyan/60">{sectorName}</span> sector. 
                        Imperial access to this domain will be restored once the quantum sync is complete.
                    </p>

                    {/* Progress Bar Simulated */}
                    <div className="w-full max-w-md mx-auto pt-10 space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural_Sync_Progress</span>
                            <span className="text-xs font-black text-hyper-cyan italic">84.2%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '84.2%' }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-hyper-cyan to-blue-600 rounded-full relative shadow-neon-cyan"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:20px_20px] animate-shimmer" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-center gap-8 pt-10 opacity-20">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Security_Gated</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Box size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Build_v4.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
