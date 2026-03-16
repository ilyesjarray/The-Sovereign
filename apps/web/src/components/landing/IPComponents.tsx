'use client';

import { motion } from 'framer-motion';
import { Target, Shield, Brain, Zap, Terminal, Code, Cpu, Database, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IPComponents() {
    const assets = [
        {
            title: 'Neural Core Engine',
            description: 'Proprietary AI integration with Groq & Llama-3.3-70B, trained for high-stakes intelligence synthesis.',
            icon: Brain,
            tags: ['AI_LOGIC', '70B_LLM', 'GROQ_ACCEL']
        },
        {
            title: 'Live Wealth Forge',
            description: 'Direct WebSocket infrastructure for global market interception and real-time capital flow analysis.',
            icon: Zap,
            tags: ['BINANCE_WS', 'COINGECKO_API', 'REAL_TIME']
        },
        {
            title: 'Sovereign Social Protocol',
            description: 'A decentralized-feel community platform with E2E encryption and AI truth-verification filters.',
            icon: Shield,
            tags: ['AUTH_E2E', 'SUPABASE_ST', 'TRUTH_VERIFY']
        },
        {
            title: 'Shadow Web Scouts',
            description: 'Autonomous agents scanning the global news flux for low-latency intelligence reports.',
            icon: Target,
            tags: ['NEWS_API', 'SERPER_SCAN', 'AUTONOMOUS']
        }
    ];

    const techStack = [
        { icon: Code, label: 'Next.js 15', detail: 'App Router / Server Components' },
        { icon: Cpu, label: 'Groq Cloud', detail: '500+ Tokens/Sec Inference' },
        { icon: Database, label: 'Supabase', detail: 'PostgreSQL / Realtime / Storage' },
        { icon: Network, label: 'Framer Motion', detail: 'Advanced Interaction Engine' }
    ];

    return (
        <section className="py-32 px-10 bg-carbon-black relative">
            <div className="max-w-7xl mx-auto space-y-24">
                <div className="flex flex-col md:flex-row items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-hyper-cyan">
                            <div className="h-[1px] w-12 bg-hyper-cyan/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] font-mono italic">IP_ASSET_INVENTORY</span>
                        </div>
                        <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">The Technology <br /> <span className="text-white/20">Moat</span></h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {assets.map((asset, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-12 glass-v-series rounded-[3.5rem] bg-white/[0.01] border border-white/5 group hover:border-hyper-cyan/30 transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <asset.icon size={180} />
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        {asset.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-[7px] font-black text-white/30 tracking-widest uppercase italic group-hover:text-hyper-cyan/40 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{asset.title}</h3>
                                </div>
                                <p className="text-white/40 text-lg font-bold italic leading-relaxed uppercase tracking-tight">
                                    {asset.description}
                                </p>
                                <div className="flex items-center gap-4 pt-6">
                                    <div className="h-[1px] flex-1 bg-white/10" />
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/20 group-hover:text-hyper-cyan group-hover:border-hyper-cyan/40 transition-all">
                                        <asset.icon size={24} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Vertical Tech Rail */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                    {techStack.map((tech, i) => (
                        <div key={i} className="flex flex-col gap-4 p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] hover:bg-white/[0.02] transition-colors">
                            <tech.icon className="w-6 h-6 text-hyper-cyan/40" />
                            <div className="space-y-1">
                                <div className="text-xs font-black text-white uppercase tracking-widest italic">{tech.label}</div>
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono italic">{tech.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
