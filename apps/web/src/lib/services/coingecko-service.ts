export interface CoinGeckoPrice {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    circulating_supply: number;
    last_updated: string;
}

export interface CoinGeckoGlobal {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
}

export class CoinGeckoService {
    private static instance: CoinGeckoService;
    private baseUrl = 'https://api.coingecko.com/api/v3';
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private cacheDuration = 5 * 60 * 1000; // 5 minutes
    private lastRequestTime = 0;
    private minRequestInterval = 1000; // 1 second between requests

    public static getInstance() {
        if (!this.instance) this.instance = new CoinGeckoService();
        return this.instance;
    }

    private async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }

    private async fetchWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data as T;
        }

        try {
            await this.waitForRateLimit();
            const data = await fetcher();
            this.cache.set(key, { data, timestamp: Date.now() });
            return data;
        } catch (error: any) {
            console.warn(`[Vault Connection Error]: API_OFFLINE or Rate Limited. Triggering Imperial Fallback Protocols for ${key}.`);
            if (cached) {
                return cached.data as T;
            }
            return this.getMockFallback(key) as T;
        }
    }

    private getMockFallback(key: string): any {
        if (key.includes('top-coins')) {
            return [
                { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 145.2, market_cap: 65000000000, market_cap_rank: 5, total_volume: 2500000000, price_change_percentage_24h: 4.2, price_change_percentage_7d: 12.5, circulating_supply: 450000000, last_updated: new Date().toISOString() },
                { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 72450, market_cap: 1400000000000, market_cap_rank: 1, total_volume: 35000000000, price_change_percentage_24h: 1.2, price_change_percentage_7d: 5.8, circulating_supply: 19700000, last_updated: new Date().toISOString() },
                { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3850, market_cap: 450000000000, market_cap_rank: 2, total_volume: 15000000000, price_change_percentage_24h: -0.5, price_change_percentage_7d: 8.2, circulating_supply: 120000000, last_updated: new Date().toISOString() }
            ];
        }
        if (key === 'global-stats') {
            return {
                total_market_cap: { usd: 2.8e12 },
                total_volume: { usd: 1.2e11 },
                market_cap_percentage: { btc: 52.4, eth: 17.2 },
                market_cap_change_percentage_24h_usd: 1.5
            };
        }
        if (key === 'trending') return [];
        if (key.includes('price')) return 145.2;
        return null;
    }

    async getTopCoins(limit: number = 10): Promise<CoinGeckoPrice[]> {
        return this.fetchWithCache(`top-coins-${limit}`, async () => {
            const response = await fetch(
                `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`
            );
            if (!response.ok) {
                if (response.status === 429) {
                    console.warn('CoinGecko Rate Limit Exceeded (429). Using fallback.');
                }
                throw new Error(`CoinGecko API error: ${response.status}`);
            }
            return response.json();
        });
    }

    async getCoinPrice(coinId: string): Promise<number> {
        return this.fetchWithCache(`price-${coinId}`, async () => {
            const response = await fetch(
                `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd`
            );
            if (!response.ok) throw new Error('CoinGecko API error');
            const data = await response.json();
            return data[coinId]?.usd || 0;
        });
    }

    async getGlobalStats(): Promise<CoinGeckoGlobal> {
        return this.fetchWithCache('global-stats', async () => {
            const response = await fetch(`${this.baseUrl}/global`);
            if (!response.ok) throw new Error('CoinGecko API error');
            const data = await response.json();
            return data.data;
        });
    }

    async getTrendingCoins(): Promise<any[]> {
        return this.fetchWithCache('trending', async () => {
            const response = await fetch(`${this.baseUrl}/search/trending`);
            if (!response.ok) throw new Error('CoinGecko API error');
            const data = await response.json();
            return data.coins.map((c: any) => c.item);
        });
    }
}
