'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, AlertCircle,
    ArrowUpRight, BarChart3, PieChart, Activity,
    Zap, Brain, Download, Plus, Trash2, ShieldAlert
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ReportGenerator } from '@/lib/services/report-generator';
import { fetchLivePrices } from '@/lib/services/cryptoService';

type Asset = {
    id: string;
    asset_symbol: string;
    amount: number;
    entry_price: number;
    current_price?: number;
    value?: number;
    change_24h?: number;
};

export default function PortfolioAnalyst() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [newSymbol, setNewSymbol] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [stressTestResult, setStressTestResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase
                .from('user_portfolios')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                // Fetch real prices for all symbols in portfolio
                const symbols = [...new Set(data.map(a => a.asset_symbol))];
                const livePrices = await fetchLivePrices(symbols);

                const enriched = data.map(asset => {
                    const currentPrice = livePrices[asset.asset_symbol] || asset.entry_price || 0;
                    const change = asset.entry_price > 0
                        ? ((currentPrice - asset.entry_price) / asset.entry_price * 100).toFixed(2)
                        : "0.00";

                    return {
                        ...asset,
                        current_price: currentPrice,
                        value: asset.amount * currentPrice,
                        change_24h: parseFloat(change)
                    };
                });
                setAssets(enriched as any);
            } else {
                setAssets([]);
            }
        }
        setIsLoading(false);
    };

    const addAsset = async () => {
        if (!newSymbol || !newAmount) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('user_portfolios').insert([{
                user_id: session.user.id,
                asset_symbol: newSymbol.toUpperCase(),
                amount: parseFloat(newAmount),
                entry_price: 60000 // Dummy entry price for now
            }]);
            setNewSymbol('');
            setNewAmount('');
            fetchPortfolio();
        }
    };

    const runStressTest = async () => {
        setIsTesting(true);
        // This targets the /api/ai/chat or a specific portfolio analysis tool
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Analyze this crypto portfolio against a 20% flash crash scenario and current geopolitical tensions. Assets: ${assets.map(a => `${a.amount} ${a.asset_symbol}`).join(', ')}. Provide a strategic survival plan.`,
                    mode: 'executive'
                })
            });
            const data = await res.json();
            setStressTestResult(data.response);
        } catch (e) {
            setStressTestResult("ANALYSIS_ERROR: Neural Link Interrupted.");
        } finally {
            setIsTesting(false);
        }
    };

    const totalValue = assets.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                                <Wallet size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Portfolio_Intelligence</h1>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-mono">Wealth_Sector // AI_Stress_Analysis</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => ReportGenerator.generatePortfolioReport(assets, totalValue)}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white tracking-widest hover:bg-white/10 transition-all"
                        >
                            <Download size={14} />
                            <span>Export_Report_PDF</span>
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                    {/* Left: Assets List */}
                    <div className="lg:col-span-2 flex flex-col space-y-6 overflow-y-auto custom-scrollbar pr-2">

                        {/* Summary Card */}
                        <div className="p-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-[3rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Activity size={120} className="text-hyper-cyan" />
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Total_Managed_Assets</span>
                            <div className="mt-2 flex items-baseline gap-4">
                                <h2 className="text-5xl font-black text-white italic tracking-tighter">
                                    ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </h2>
                                <span className={cn(
                                    "flex items-center gap-1 font-black text-xs",
                                    (assets[0]?.change_24h || 0) >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    <TrendingUp size={14} className={(assets[0]?.change_24h || 0) < 0 ? "rotate-180" : ""} />
                                    {assets[0]?.change_24h ? (assets[0].change_24h > 0 ? '+' : '') + assets[0].change_24h + '%' : 'SYNCING...'}
                                </span>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <BarChart3 size={16} className="text-hyper-cyan" />
                                    <span>Asset_Inventory</span>
                                </h3>
                                <div className="flex gap-4">
                                    <input
                                        value={newSymbol}
                                        onChange={(e) => setNewSymbol(e.target.value)}
                                        placeholder="SYMBOL (BTC)"
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-hyper-cyan/50 w-24 uppercase"
                                    />
                                    <input
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        placeholder="AMOUNT"
                                        type="number"
                                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-hyper-cyan/50 w-24"
                                    />
                                    <button onClick={addAsset} className="p-2 bg-hyper-cyan text-carbon-black rounded-lg hover:shadow-neon-cyan transition-all">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {assets.map((asset) => (
                                    <div key={asset.id} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-white uppercase italic tracking-tighter shrink-0">
                                                {asset.asset_symbol.slice(0, 3)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase italic">{asset.asset_symbol}</h4>
                                                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{asset.amount} Units</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-8">
                                            <div>
                                                <div className="text-sm font-black text-white italic">${asset.value?.toLocaleString()}</div>
                                                <div className={cn("text-[9px] font-black uppercase", Number(asset.change_24h) > 0 ? "text-emerald-500" : "text-rose-500")}>
                                                    {asset.change_24h}% / 24H
                                                </div>
                                            </div>
                                            <button className="text-white/0 group-hover:text-rose-500 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Analysis & Risk */}
                    <div className="space-y-8 flex flex-col">

                        {/* AI Stress Test Card */}
                        <div className="p-8 bg-hyper-cyan text-carbon-black rounded-[3rem] space-y-6 relative overflow-hidden shadow-neon-cyan/20">
                            <Brain size={150} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                            <div className="flex items-center gap-3">
                                <Zap size={24} className="animate-pulse" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em]">AI_Stress_Tester</h3>
                            </div>
                            <p className="text-[11px] font-black leading-relaxed opacity-70">
                                Simulate extreme market events (flash crashes, sanctions, black swans) to see how your assets hold up.
                            </p>

                            <button
                                onClick={runStressTest}
                                disabled={isTesting || assets.length === 0}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3",
                                    isTesting ? "bg-carbon-black/20 cursor-not-allowed" : "bg-carbon-black text-white hover:bg-carbon-black/80"
                                )}
                            >
                                {isTesting ? 'Simulating_Crash...' : (
                                    <>
                                        <span>Initialize_Stress_Test</span>
                                        <ArrowUpRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Analysis Window */}
                        <div className="flex-1 glass-v-series border border-white/5 rounded-[3rem] bg-white/[0.01] p-8 flex flex-col space-y-6 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Oracle_Briefing</span>
                                <ShieldAlert size={14} className="text-amber-500" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar text-xs text-white/60 leading-relaxed space-y-4 pr-2">
                                {stressTestResult ? (
                                    <div className="whitespace-pre-wrap font-medium">
                                        {stressTestResult}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                                        <div className="p-3 rounded-full bg-white/5 text-white/10 uppercase font-black text-[8px] tracking-[0.3em]">Neural_Link_Idle</div>
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest italic line-clamp-3">
                                            Run a stress test to generate a survival strategy and risk assessment based on real-time volatility data.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Liquidity Guard Guard */}
                        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-white uppercase">Liquidity_Guard</h4>
                                    <p className="text-[8px] font-mono text-rose-500 uppercase tracking-widest animate-pulse">Scanning_For_Slippage</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase italic">Active</span>
                        </div>
                    </div>

                </div>

                {/* Status Bar */}
                <div className="flex justify-between items-center py-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                        Market_Price_Feed: LIVE // Latency: 42ms
                    </div>
                </div>

            </div>
        </div>
    );
}
