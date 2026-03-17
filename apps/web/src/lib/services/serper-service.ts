/**
 * Serper API Service
 * Real-time crypto intelligence and news aggregation
 */

export interface SerperNewsResult {
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
    imageUrl?: string;
}

export interface SerperResponse {
    news: SerperNewsResult[];
    searchParameters: {
        q: string;
        type: string;
    };
}

export interface CryptoIntelligence {
    id: string;
    title: string;
    url: string;
    summary: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    relevanceScore?: number;
}

class SerperService {
    private apiKey: string;
    private baseUrl = 'https://google.serper.dev';
    private cache: Map<string, { data: CryptoIntelligence[]; timestamp: number }> = new Map();
    private cacheDuration = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.apiKey = process.env.SERPER_API_KEY || '';
        if (!this.apiKey && typeof window === 'undefined') {
            console.warn('SYSTEM_WARNING: SERPER_API_KEY not found. Using fallback data.');
        }
    }

    /**
     * Fetch crypto news and intelligence
     */
    async fetchCryptoIntel(query: string = 'cryptocurrency bitcoin ethereum'): Promise<CryptoIntelligence[]> {
        // Check cache first
        const cached = this.cache.get(query);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        // If no API key, empty array (we don't want fake data anymore)
        if (!this.apiKey) {
            console.error('SERPER_API_KEY NOT FOUND. Live data unavailable.');
            return [];
        }

        try {
            const response = await fetch(`${this.baseUrl}/news`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: query,
                    num: 20,
                }),
            });

            if (!response.ok) {
                throw new Error(`Serper API error: ${response.status}`);
            }

            const data: SerperResponse = await response.json();
            const intelligence = this.transformToIntelligence(data.news);

            // Cache the results
            this.cache.set(query, { data: intelligence, timestamp: Date.now() });

            return intelligence;
        } catch (error) {
            console.error('Error fetching from Serper API:', error);
            return this.getFallbackData();
        }
    }

    /**
     * General search for verification
     */
    async search(query: string) {
        return this.fetchCryptoIntel(query);
    }

    /**
     * Fetch whale movement news
     */
    async fetchWhaleIntel(): Promise<CryptoIntelligence[]> {
        return this.fetchCryptoIntel('cryptocurrency whale movements large transactions');
    }

    /**
     * Fetch market sentiment news
     */
    async fetchMarketSentiment(): Promise<CryptoIntelligence[]> {
        return this.fetchCryptoIntel('cryptocurrency market sentiment analysis');
    }

    /**
     * Fetch DeFi protocol news
     */
    async fetchDeFiIntel(): Promise<CryptoIntelligence[]> {
        return this.fetchCryptoIntel('DeFi protocol updates ethereum solana');
    }

    /**
     * Transform Serper results to CryptoIntelligence format
     */
    private transformToIntelligence(results: SerperNewsResult[]): CryptoIntelligence[] {
        return results.map((result, index) => ({
            id: `serper-${Date.now()}-${index}`,
            title: result.title,
            url: result.link,
            summary: result.snippet,
            source: result.source,
            publishedAt: result.date,
            imageUrl: result.imageUrl,
            sentiment: this.analyzeSentiment(result.title + ' ' + result.snippet),
            relevanceScore: this.calculateRelevance(result.title + ' ' + result.snippet),
        }));
    }

    /**
     * Simple sentiment analysis based on keywords
     */
    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const lowerText = text.toLowerCase();

        const positiveKeywords = ['surge', 'rally', 'gain', 'bullish', 'breakthrough', 'adoption', 'growth', 'rise', 'soar', 'profit'];
        const negativeKeywords = ['crash', 'drop', 'fall', 'bearish', 'decline', 'loss', 'plunge', 'risk', 'warning', 'hack'];

        const positiveCount = positiveKeywords.filter(kw => lowerText.includes(kw)).length;
        const negativeCount = negativeKeywords.filter(kw => lowerText.includes(kw)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * Calculate relevance score based on crypto keywords
     */
    private calculateRelevance(text: string): number {
        const lowerText = text.toLowerCase();
        const keywords = ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft', 'whale', 'trading'];

        const matches = keywords.filter(kw => lowerText.includes(kw)).length;
        return Math.min(matches / keywords.length, 1);
    }

    /**
     * Fallback data when API is unavailable
     */
    private getFallbackData(): CryptoIntelligence[] {
        return [
            {
                id: 'fallback-1',
                title: 'Bitcoin Reaches New All-Time High Above $100K',
                url: '#',
                summary: 'Bitcoin surpasses $100,000 for the first time in history as institutional adoption accelerates.',
                source: 'CryptoNews',
                publishedAt: new Date().toISOString(),
                sentiment: 'positive',
                relevanceScore: 0.95,
            },
            {
                id: 'fallback-2',
                title: 'Ethereum 2.0 Staking Reaches Record Levels',
                url: '#',
                summary: 'Over 30 million ETH now staked as network transitions to proof-of-stake consensus.',
                source: 'DeFi Pulse',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                sentiment: 'positive',
                relevanceScore: 0.88,
            },
            {
                id: 'fallback-3',
                title: 'Major Exchange Reports Unusual Whale Activity',
                url: '#',
                summary: 'Large wallet movements detected across multiple exchanges, signaling potential market shift.',
                source: 'Whale Alert',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                sentiment: 'neutral',
                relevanceScore: 0.92,
            },
        ];
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Singleton instance
let serperServiceInstance: SerperService | null = null;

export function getSerperService(): SerperService {
    if (!serperServiceInstance) {
        serperServiceInstance = new SerperService();
    }
    return serperServiceInstance;
}

export default SerperService;
