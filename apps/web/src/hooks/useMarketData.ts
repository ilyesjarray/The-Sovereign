'use client';

import useSWR from 'swr';
import { MarketStats } from '@/lib/services/market-data';
import { useMarketStore } from '@/store/useMarketStore';
import { useEffect } from 'react';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url, { method: 'POST' }).then(r => r.json());

export function useMarketData(initialData?: MarketStats) {
    const { data, error, isLoading } = useSWR<MarketStats>('/api/market-data', fetcher, {
        fallbackData: initialData,
        refreshInterval: 0, // Disable polling, using WebSockets now
        revalidateOnFocus: false,
    });

    const updatePrice = useMarketStore.getState().updatePrice;
    const marketPrices = useMarketStore((state: any) => state.prices);

    // Sync SWR data into Zustand store once on initial load
    useEffect(() => {
        if (data?.topCoins) {
            data.topCoins.forEach((coin) => {
                updatePrice(coin.symbol.toUpperCase() + 'USDT', coin.current_price, coin.price_change_percentage_24h);
            });
        }
    }, [data, updatePrice]);

    return {
        marketData: data,
        realtimePrices: marketPrices,
        isLoading,
        isError: error,
    };
}
