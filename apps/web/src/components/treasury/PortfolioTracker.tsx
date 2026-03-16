'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioService, PortfolioHolding } from '@/lib/services/portfolio-service';
import { CoinGeckoService } from '@/lib/services/coingecko-service';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export function PortfolioTracker() {
    const { user } = useUser();
    const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newHolding, setNewHolding] = useState({ symbol: '', amount: '', buyPrice: '' });

    const loadHoldings = useCallback(async () => {
        if (!user) return;
        const portfolio = PortfolioService.getInstance();
        const data = await portfolio.getHoldings(user.id);

        // Fetch current prices
        const coinGecko = CoinGeckoService.getInstance();
        const enriched = await Promise.all(data.map(async (h) => {
            try {
                const price = await coinGecko.getCoinPrice(h.symbol.toLowerCase());
                return { ...h, current_price: price };
            } catch {
                return h;
            }
        }));

        setHoldings(enriched);
    }, [user]);

    useEffect(() => {
        if (user) {
            loadHoldings();
        }
    }, [user, loadHoldings]);

    const addHolding = async () => {
        if (!user || !newHolding.symbol || !newHolding.amount || !newHolding.buyPrice) return;

        const portfolio = PortfolioService.getInstance();
        const success = await portfolio.addHolding({
            user_id: user.id,
            symbol: newHolding.symbol.toUpperCase(),
            amount: parseFloat(newHolding.amount),
            buy_price: parseFloat(newHolding.buyPrice)
        });

        if (success) {
            setNewHolding({ symbol: '', amount: '', buyPrice: '' });
            setIsAddingNew(false);
            loadHoldings();
        }
    };

    const removeHolding = async (id: string) => {
        const portfolio = PortfolioService.getInstance();
        const success = await portfolio.removeHolding(id);
        if (success) loadHoldings();
    };

    const stats = PortfolioService.getInstance().calculateStats(holdings);

    return (
        <div className="liquid-glass rounded-[2rem] p-8 border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-black uppercase tracking-tighter">PORTFOLIO VAULT</h3>
                        <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Holdings & P/L Tracker</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAddingNew(!isAddingNew)}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-black uppercase">Add Holding</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">Total Value</div>
                    <div className="text-xl font-black text-white">${stats.totalValue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">Total Cost</div>
                    <div className="text-xl font-black text-white">${stats.totalCost.toLocaleString()}</div>
                </div>
                <div className={cn(
                    "p-4 border rounded-xl",
                    stats.totalPnL >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                )}>
                    <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2">P/L</div>
                    <div className={cn(
                        "text-xl font-black flex items-center gap-2",
                        stats.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                        {stats.totalPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        ${Math.abs(stats.totalPnL).toLocaleString()} ({stats.totalPnLPercentage.toFixed(2)}%)
                    </div>
                </div>
            </div>

            {/* Add New Holding */}
            <AnimatePresence>
                {isAddingNew && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl"
                    >
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Symbol (BTC)"
                                value={newHolding.symbol}
                                onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newHolding.amount}
                                onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                            <input
                                type="number"
                                placeholder="Buy Price"
                                value={newHolding.buyPrice}
                                onChange={(e) => setNewHolding({ ...newHolding, buyPrice: e.target.value })}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button
                            onClick={addHolding}
                            className="mt-4 w-full px-4 py-2 bg-emerald-500 text-white rounded-lg font-black uppercase text-xs hover:bg-emerald-600 transition-all"
                        >
                            Add to Portfolio
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Holdings List */}
            <div className="space-y-3">
                {holdings.map((holding) => {
                    const pnl = holding.current_price
                        ? (holding.current_price - holding.buy_price) * holding.amount
                        : 0;
                    const pnlPercent = holding.current_price
                        ? ((holding.current_price - holding.buy_price) / holding.buy_price) * 100
                        : 0;

                    return (
                        <motion.div
                            key={holding.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-black text-white">{holding.symbol}</div>
                                        <div className="text-xs text-white/40">{holding.amount} units</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
                                        <span>Buy: ${holding.buy_price.toLocaleString()}</span>
                                        {holding.current_price && (
                                            <span>Current: ${holding.current_price.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-sm font-black",
                                            pnl >= 0 ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USD
                                        </div>
                                        <div className="text-[10px] text-white/40">
                                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeHolding(holding.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
