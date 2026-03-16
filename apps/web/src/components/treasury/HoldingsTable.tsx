'use client';

import { useState, useEffect } from 'react';
import { FinanceService, CoinData } from '@/lib/services/finance-service';

export function HoldingsTable() {
    const [coins, setCoins] = useState<CoinData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        FinanceService.getTopCoins(15).then(data => {
            setCoins(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-2 border-neon-blue/10 border-t-neon-blue animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue/40 animate-pulse">
                    SYNCING_GLOBAL_LEDGER...
                </span>
            </div>
        );
    }

    return (
        <div className="bg-transparent overflow-hidden font-mono flex-1 relative">
            {/* Fade Out Top/Bottom */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

            <div className="overflow-x-auto h-full overflow-y-auto scrollbar-hide pb-8">
                <table className="w-full text-left text-[11px] relative">
                    <thead className="bg-neon-blue/5 text-neon-blue/40 uppercase tracking-[0.2em] sticky top-0 z-20 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-4 font-black">ASSET_IDENTIFIER</th>
                            <th className="px-6 py-4 font-black">PRICE (USD)</th>
                            <th className="px-6 py-4 font-black">24H DELTA</th>
                            <th className="px-6 py-4 font-black">MKT CAP</th>
                            <th className="px-6 py-4 font-black">VOLUME (24H)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neon-blue/5">
                        {coins.map((coin, i) => (
                            <tr key={coin.id} className="hover:bg-neon-blue/[0.05] transition-colors group cursor-pointer text-neon-blue/80">
                                <td className="px-6 py-4 font-black flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-none border border-neon-blue/20 flex flex-shrink-0 items-center justify-center p-1 bg-black group-hover:border-neon-blue/60 transition-colors shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                                        <img src={coin.image} alt={coin.symbol} className="w-full h-full object-contain filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white group-hover:text-neon-blue transition-colors truncate">{coin.name}</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] text-neon-blue/40 tracking-widest uppercase">{coin.symbol}</span>
                                            <span className="px-1 py-0.5 bg-white/5 text-[8px] rounded text-zinc-500">#{coin.market_cap_rank}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black tabular-nums text-white">
                                    {FinanceService.formatPrice(coin.current_price)}
                                </td>
                                <td className="px-6 py-4 font-black tabular-nums">
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded bg-black/40 border inline-flex ${coin.price_change_percentage_24h >= 0
                                            ? 'text-sovereign-blue border-sovereign-blue/20 shadow-[0_0_10px_rgba(80,200,120,0.1)]'
                                            : 'text-rose-500 border-rose-500/20 shadow-[0_0_10px_rgba(224,82,82,0.1)]'
                                        }`}>
                                        {coin.price_change_percentage_24h > 0 ? '+' : ''}
                                        {coin.price_change_percentage_24h.toFixed(2)}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black tabular-nums text-neon-blue/60">
                                    {FinanceService.formatLarge(coin.market_cap)}
                                </td>
                                <td className="px-6 py-4 font-black tabular-nums text-neon-blue/40">
                                    {FinanceService.formatLarge(coin.total_volume)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
