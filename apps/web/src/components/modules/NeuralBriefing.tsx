'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Target,
    TrendingUp,
    ShieldCheck,
    ChevronRight,
    Cpu,
    Calendar,
    X,
    Volume2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { SocialIntelligenceService } from '@/lib/services/social-intelligence';

interface NeuralBriefingProps {
    onClose: () => void;
}

export function NeuralBriefing({ onClose }: NeuralBriefingProps) {
    const [data, setData] = useState<any>(null);
    const [step, setStep] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        fetchBriefingData();
    }, []);

    const fetchBriefingData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: briefings, error } = await supabase
                .from('neural_briefings')
                .select('*')
                .eq('user_id', session.user.id)
                .order('briefing_date', { ascending: false })
                .limit(1);

            if (!error && briefings && briefings.length > 0) {
                const b = briefings[0];
                const socialPulse = await SocialIntelligenceService.getInstance().getGlobalSocialPulse();

                setData({
                    date: new Date(b.briefing_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    intel: b.intel_summary,
                    missions: "Critical missions pending in Mission Control.",
                    wealth: b.wealth_snapshot?.growth || "+0.0% Stable",
                    advice: b.strategic_advice || "Awaiting neural synthesis.",
                    social: socialPulse
                });
            } else {
                // Fallback / Auto-generate if no record found
                const socialPulse = await SocialIntelligenceService.getInstance().getGlobalSocialPulse();
                setData({
                    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    intel: "Market synchronization active. Digital Scouts patrolling sectors.",
                    missions: "All critical missions currently archived.",
                    wealth: "+0.0% Neutral Growth",
                    advice: "Initialize Fleet Simulator for detailed projections.",
                    social: socialPulse
                });
            }
        }
    };

    const steps = [
        { title: "INITIALIZING_SYNC", label: "Neural_Link_Established" },
        { title: "GATHERING_INTEL", label: "Scout_Array_Responsive" },
        { title: "ANALYZING_WEALTH", label: "Wealth_Forge_Optimal" },
        { title: "FINALIZING_REPORT", label: "Ready_For_Commander" }
    ];

    useEffect(() => {
        if (step < steps.length - 1) {
            const timer = setTimeout(() => setStep(s => s + 1), 800);
            return () => clearTimeout(timer);
        }
    }, [step]);

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
        >
            {/* Background Cinematic Grid */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,255,242,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,242,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />

            <div className="relative max-w-4xl w-full space-y-12">
                {/* Loading Sequence */}
                {step < steps.length - 1 && (
                    <div className="flex flex-col items-center justify-center space-y-8">
                        <div className="w-24 h-24 rounded-full border-2 border-hyper-cyan/20 border-t-hyper-cyan animate-spin" />
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black text-white italic tracking-[0.2em]">{steps[step].title}</h2>
                            <p className="text-[10px] text-hyper-cyan uppercase font-mono tracking-widest">{steps[step].label}</p>
                        </div>
                    </div>
                )}

                {/* Full Briefing Display */}
                {step === steps.length - 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-10"
                    >
                        <div className="flex justify-between items-start border-b border-white/5 pb-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-hyper-cyan/20 border border-hyper-cyan/40">
                                        <Zap className="w-6 h-6 text-hyper-cyan" />
                                    </div>
                                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Strat_Briefing</h1>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono uppercase tracking-[0.4em]">
                                    <Calendar size={12} /> {data.date} // Sync: Global-Prime
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-rose-500/10 hover:border-rose-500/40 text-white/20 hover:text-rose-500 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 text-left">
                            {/* Intel Block */}
                            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={80} className="text-hyper-cyan" />
                                </div>
                                <div className="flex items-center gap-3 text-hyper-cyan">
                                    <Cpu size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Global_Intelligence</span>
                                </div>
                                <p className="text-lg font-bold text-white leading-relaxed font-mono uppercase italic tracking-tight">
                                    {data.intel}
                                </p>
                            </div>

                            {/* Social Pulse Block */}
                            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Volume2 size={80} className="text-hyper-cyan" />
                                </div>
                                <div className="flex items-center gap-3 text-hyper-cyan">
                                    <Target size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Global_Social_Pulse</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-bold text-white leading-relaxed font-mono uppercase italic tracking-tight">
                                        SENTIMENT: {data.social?.sentiment} ({data.social?.value})
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-hyper-cyan shadow-neon-cyan transition-all duration-1000"
                                                style={{ width: `${data.social?.value || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[8px] font-mono text-white/40">S_VOL: {data.social?.velocity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wealth Block */}
                            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={80} className="text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <TrendingUp size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Assets_Trajectory</span>
                                </div>
                                <p className="text-lg font-bold text-white leading-relaxed font-mono uppercase italic tracking-tight">
                                    {data.wealth}
                                </p>
                            </div>

                            {/* Missions Block */}
                            <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4 relative overflow-hidden group col-span-full">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Target size={120} className="text-amber-500" />
                                </div>
                                <div className="flex items-center gap-3 text-amber-500">
                                    <Target size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pending_Mission_Criticals</span>
                                </div>
                                <p className="text-lg font-bold text-white leading-relaxed font-mono uppercase italic tracking-tight">
                                    {data.missions}
                                </p>
                            </div>
                        </div>

                        {/* Strategic Advice (AI) */}
                        <div className="p-10 bg-gradient-to-br from-hyper-cyan/10 to-transparent border-2 border-hyper-cyan/30 rounded-[3rem] space-y-6 relative overflow-hidden">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-hyper-cyan bg-hyper-cyan/20 flex items-center justify-center animate-pulse">
                                    <Volume2 className="text-hyper-cyan w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.3em]">Neural_Advisory</span>
                                    <h3 className="text-xl font-black text-white italic tracking-tighter">Strategic_Guidance_Active</h3>
                                </div>
                            </div>
                            <p className="text-2xl font-black text-white italic leading-tight uppercase tracking-tighter">
                                " {data.advice} "
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-8 bg-white text-carbon-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.8em] hover:bg-hyper-cyan hover:shadow-neon-cyan transition-all flex items-center justify-center gap-4 group"
                        >
                            Enter_Sovereign_Command
                            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
