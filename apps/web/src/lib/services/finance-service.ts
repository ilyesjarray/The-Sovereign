/**
 * Sovereign Financial Intelligence Service
 * Real data from CoinGecko (free), Alternative.me, and Gas Oracle — no API keys needed.
 */

export interface CoinData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d_in_currency?: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    circulating_supply: number;
    image: string;
    ath: number;
    ath_change_percentage: number;
    sparkline_in_7d?: { price: number[] };
}

export interface FearGreedData {
    value: string;
    value_classification: string;
    timestamp: string;
}

export interface GasData {
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
}

export interface MarketGlobal {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 60_000; // 1-minute cache

async function cachedFetch<T>(url: string, ttl = TTL): Promise<T | null> {
    const existing = cache.get(url);
    if (existing && Date.now() - existing.ts < ttl) return existing.data as T;
    try {
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        cache.set(url, { data, ts: Date.now() });
        return data as T;
    } catch (err) {
        console.warn('Finance fetch error:', url, err);
        return null;
    }
}

export const FinanceService = {
    /** Top N coins by market cap with sparklines */
    async getTopCoins(n = 50): Promise<CoinData[]> {
        const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${n}&page=1&sparkline=true&price_change_percentage=7d`;
        return await cachedFetch<CoinData[]>(url) ?? [];
    },

    /** Single coin detail */
    async getCoin(id: string): Promise<any | null> {
        return cachedFetch(`${COINGECKO_BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`);
    },

    /** Global market stats */
    async getGlobalStats(): Promise<MarketGlobal | null> {
        const res = await cachedFetch<{ data: MarketGlobal }>(`${COINGECKO_BASE}/global`);
        return res?.data ?? null;
    },

    /** Trending coins (top 7 searches last 24h) */
    async getTrending(): Promise<any[]> {
        const res = await cachedFetch<{ coins: any[] }>(`${COINGECKO_BASE}/search/trending`);
        return res?.coins ?? [];
    },

    /** Fear & Greed Index from alternative.me */
    async getFearGreed(): Promise<FearGreedData | null> {
        const res = await cachedFetch<{ data: FearGreedData[] }>('https://api.alternative.me/fng/?limit=1');
        return res?.data?.[0] ?? null;
    },

    /** Historical OHLC for a coin (days = 1, 7, 14, 30, 90, 180, 365) */
    async getOHLC(coinId: string, days: number): Promise<number[][] | null> {
        return cachedFetch(`${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);
    },

    /** Price history sparkline */
    async getPriceHistory(coinId: string, days: number): Promise<{ prices: [number, number][] } | null> {
        return cachedFetch(`${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    },

    /** Top gainers/losers from market data */
    topGainersLosers(coins: CoinData[], n = 5): { gainers: CoinData[]; losers: CoinData[] } {
        const sorted = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        return { gainers: sorted.slice(0, n), losers: sorted.slice(-n).reverse() };
    },

    /** Format large numbers (1.2B, 45.3M) */
    formatLarge(n: number): string {
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
    },

    /** Format price with appropriate decimals */
    formatPrice(n: number): string {
        if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
        if (n >= 1) return `$${n.toFixed(4)}`;
        return `$${n.toFixed(8)}`;
    }
};
