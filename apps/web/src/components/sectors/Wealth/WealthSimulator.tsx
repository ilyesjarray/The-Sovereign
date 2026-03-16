'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Target,
    BarChart3,
    Zap,
    Calculator,
    LineChart,
    RefreshCw,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function WealthSimulator() {
    const [initialCapital, setInitialCapital] = useState(0);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [returnRate, setReturnRate] = useState(12);
    const [years, setYears] = useState(10);
    const supabase = createClient();

    useEffect(() => {
        const fetchRealCapital = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Get real portfolio total
                const { data: p } = await supabase.from('user_portfolios').select('*');
                if (p && p.length > 0) {
                    const marketRes = await fetch('/api/market-data', { method: 'POST' });
                    if (marketRes.ok) {
                        const md = await marketRes.json();
                        let total = 0;
                        p.forEach(asset => {
                            const coin = md.topCoins?.find((c: any) => c.symbol.toLowerCase() === asset.asset_symbol.toLowerCase());
                            if (coin) total += asset.amount * coin.current_price;
                        });
                        if (total > 0) setInitialCapital(Math.round(total));
                        else setInitialCapital(10000); // Fallback to 10k if empty but realistic
                    }
                } else {
                    setInitialCapital(10000);
                }
            }
        };
        fetchRealCapital();
    }, []);

    const simulationData = useMemo(() => {
        let total = initialCapital;
        const points: { year: number; value: number }[] = [];
        const monthlyRate = returnRate / 100 / 12;

        for (let month = 0; month <= years * 12; month++) {
            if (month > 0) {
                total = (total + monthlyContribution) * (1 + monthlyRate);
            }
            if (month % 12 === 0) {
                points.push({ year: month / 12, value: Math.round(total) });
            }
        }
        return points;
    }, [initialCapital, monthlyContribution, returnRate, years]);

    const finalValue = simulationData[simulationData.length - 1].value;

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10">

                {/* Simulator Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <Calculator className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Fleet_Simulator</h1>
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-mono">Wealth_Projection_Engine_v1.0</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Projected_Net_Worth</span>
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-4xl font-black text-emerald-500 italic tracking-tighter">${finalValue.toLocaleString()}</span>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10 flex-1 overflow-hidden">

                    {/* Controls Panel */}
                    <div className="space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                                    Initial_Capital <span>${initialCapital.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range" min="1000" max="1000000" step="1000"
                                    value={initialCapital}
                                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                                    Monthly_Injection <span>${monthlyContribution.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range" min="0" max="50000" step="100"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                                    Yield_Rate <span>{returnRate}% APY</span>
                                </label>
                                <input
                                    type="range" min="1" max="100" step="1"
                                    value={returnRate}
                                    onChange={(e) => setReturnRate(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex justify-between">
                                    Time_Horizon <span>{years} Years</span>
                                </label>
                                <input
                                    type="range" min="1" max="50" step="1"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-white/20">
                                <Coins size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Compounding: MONTHLY</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/20">
                                <Target size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Inflation_Adjusted: OFF</span>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="lg:col-span-2 flex flex-col space-y-8 bg-white/[0.01] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <TrendingUp size={240} className="text-emerald-500" />
                        </div>

                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <LineChart className="text-emerald-500" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Growth_Projection_Matrix</h3>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                <RefreshCw size={12} /> Reset_Model
                            </button>
                        </div>

                        {/* Simple Custom Bar Chart for Visualization */}
                        <div className="flex-1 flex items-end gap-2 pb-6 relative z-10">
                            {simulationData.map((p, i) => {
                                const height = (p.value / finalValue) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                        <div className="relative w-full h-full flex flex-col justify-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 border-t-2 border-emerald-500 transition-all rounded-t-lg"
                                            />
                                        </div>
                                        <span className="text-[8px] font-mono text-white/20 group-hover:text-emerald-500 transition-colors">Y{p.year}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">Total_Contributions</span>
                                <span className="text-xl font-black text-white italic tracking-tighter">
                                    ${(initialCapital + (monthlyContribution * years * 12)).toLocaleString()}
                                </span>
                            </div>
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2">Estimated_Yield</span>
                                <span className="text-xl font-black text-emerald-500 italic tracking-tighter">
                                    ${(finalValue - (initialCapital + (monthlyContribution * years * 12))).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advisory Footer */}
                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
                    <BarChart3 className="text-emerald-500 shrink-0" size={24} />
                    <p className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest leading-relaxed">
                        Imperial_Advisory: Projections are based on historical neural patterns.
                        Real-world variance may affect outcome levels. Standard Sovereign risk protocols apply.
                    </p>
                </div>
            </div>
        </div>
    );
}
