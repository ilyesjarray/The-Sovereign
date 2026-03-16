'use client';

import { motion } from 'framer-motion';
import { Download, FileText, Mail, ChevronRight, Globe, Lock } from 'lucide-react';
import { useState } from 'react';

export function DownloadDeck() {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/sovereign_sales_deck.pdf'; // This will be simulated or the developer will provide the actual asset
        link.download = 'sovereign_sales_deck.pdf';
        link.click();
    };

    return (
        <section className="py-40 px-10 bg-carbon-black relative overflow-hidden">
            {/* Focal Point Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-hyper-cyan/[0.03] rounded-full blur-[160px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="glass-v-series rounded-[4rem] p-16 md:p-24 bg-white/[0.01] border border-white/10 relative overflow-hidden group">
                    {/* Floating Symbols */}
                    <div className="absolute top-0 right-0 p-16 opacity-[0.02] rotate-12">
                        <Globe size={300} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-hyper-cyan">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] font-mono italic">SECURE_DUE_DILIGENCE</span>
                                </div>
                                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">Download the <br /> <span className="text-hyper-cyan italic drop-shadow-neon-cyan text-7xl">Sales Deck</span></h2>
                            </div>

                            <p className="text-white/40 text-lg font-bold italic leading-relaxed uppercase">
                                Access the full technical and financial breakdown of the Sovereign IP assets. Learn why our reality-infusion engine is the next paradigm in business intelligence.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    'Full IP Inventory & Rights',
                                    'Revenue Projections & Scale',
                                    'Groq AI Tuning Technical Docs',
                                    'Market Dominance Strategy'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-[10px] font-black text-white/60 uppercase tracking-widest italic">
                                        <div className="w-2 h-2 rounded-full bg-hyper-cyan" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-8">
                            <div className="p-10 bg-carbon-black/60 rounded-[2.5rem] border border-white/5 space-y-8 backdrop-blur-3xl shadow-2xl">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4 italic">Corporate_Access_Uplink</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ENTER_YOUR_CORPORATE_EMAIL..."
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm font-black text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all font-mono tracking-tighter italic"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownload}
                                    className="w-full py-7 bg-white text-carbon-black rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-hyper-cyan transition-all shadow-neon-cyan flex items-center justify-center gap-4 italic"
                                >
                                    <Download size={20} />
                                    Initialize_PDF_Export
                                </button>

                                <p className="text-center text-[8px] text-white/10 uppercase tracking-widest font-mono italic">
                                    By submitting, you agree to the NDA and standard Sovereign Protocol terms.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Partnership Footer */}
                <div className="mt-20 flex flex-col items-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                    <span className="text-[9px] font-black text-white uppercase tracking-[1em] italic">Strategic_Technology_Partners</span>
                    <div className="flex flex-wrap justify-center gap-16 text-white font-black italic tracking-tighter text-2xl uppercase">
                        <span>GROQ</span>
                        <span>SUPABASE</span>
                        <span>NEXT.JS</span>
                        <span>FRAMER</span>
                        <span>TAILWIND</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
