'use client';

import { motion } from 'framer-motion';
import { useMarketData } from '@/hooks/useMarketData';

export function ZeroUINodes() {
    const { marketData } = useMarketData();
    const btc = marketData?.topCoins.find(c => c.symbol.toLowerCase() === 'btc');
    const eth = marketData?.topCoins.find(c => c.symbol.toLowerCase() === 'eth');

    const nodes = [
        { label: 'BTC/USD', value: btc ? `$${btc.current_price.toLocaleString()}` : '---', pos: 'top-10 left-10' },
        { label: 'ETH/USD', value: eth ? `$${eth.current_price.toLocaleString()}` : '---', pos: 'top-10 right-10' },
        { label: 'GLOBAL VOL', value: marketData?.totalVolume ? `$${(marketData.totalVolume / 1e9).toFixed(1)}B` : '---', pos: 'bottom-10 left-10' },
        { label: 'DOMINANCE', value: marketData?.btcDominance ? `${marketData.btcDominance.toFixed(1)}%` : '---', pos: 'bottom-10 right-10' }
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {nodes.map((node, i) => (
                <div
                    key={i}
                    className={`absolute ${node.pos} w-24 h-24 flex items-center justify-center pointer-events-auto group translate-x-[-15%] translate-y-[-15%]`}
                >
                    <motion.div
                        className="opacity-0 group-hover:opacity-40 transition-opacity duration-500 flex flex-col items-center gap-1 group-hover:scale-105 transition-transform duration-500"
                    >
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">{node.label}</span>
                        <span className="text-[12px] font-black text-white/50 tracking-widest">{node.value}</span>
                    </motion.div>
                </div>
            ))}
        </div>
    );
}
