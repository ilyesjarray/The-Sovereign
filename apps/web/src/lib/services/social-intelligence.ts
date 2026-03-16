'use client';

export interface SocialSentiment {
    source: 'X' | 'TELEGRAM' | 'CRYPTOCOMPARE' | 'FEAR_GREED';
    score: number; // 0 to 100
    velocity: number; // speed of discussion
    keyKeywords: string[];
    topSignal: string;
}

export class SocialIntelligenceService {
    private static instance: SocialIntelligenceService;
    private fngApi = 'https://api.alternative.me/fng/?limit=1';
    private cache: { data: SocialSentiment | null; timestamp: number } = { data: null, timestamp: 0 };
    private cacheDuration = 10 * 60 * 1000; // 10 minutes

    public static getInstance() {
        if (!this.instance) this.instance = new SocialIntelligenceService();
        return this.instance;
    }

    async getGlobalSocialPulse(): Promise<SocialSentiment> {
        // Check cache
        if (this.cache.data && Date.now() - this.cache.timestamp < this.cacheDuration) {
            return this.cache.data;
        }

        try {
            // Fetch Fear & Greed Index
            const fngRes = await fetch(this.fngApi);
            if (!fngRes.ok) throw new Error('FNG API error');

            const fngData = await fngRes.json();
            const fngValue = parseInt(fngData.data[0].value);
            const classification = fngData.data[0].value_classification;

            // Calculate velocity based on value change
            const velocity = Math.abs(fngValue - 50) / 5; // 0-10 scale

            const sentiment: SocialSentiment = {
                source: 'FEAR_GREED',
                score: fngValue,
                velocity: velocity,
                keyKeywords: this.getKeywordsFromSentiment(fngValue),
                topSignal: `Market sentiment: ${classification} (${fngValue}/100)`
            };

            this.cache = { data: sentiment, timestamp: Date.now() };
            return sentiment;
        } catch (error) {
            console.error('[Social Intelligence]: API error', error);
            // Fallback to cached data or default
            return this.cache.data || {
                source: 'FEAR_GREED',
                score: 50,
                velocity: 5,
                keyKeywords: ['NEUTRAL', 'STABLE'],
                topSignal: 'Market sentiment data temporarily unavailable'
            };
        }
    }

    private getKeywordsFromSentiment(score: number): string[] {
        if (score >= 75) return ['EXTREME_GREED', 'FOMO', 'EUPHORIA', 'BULLISH'];
        if (score >= 60) return ['GREED', 'OPTIMISM', 'BUYING'];
        if (score >= 40) return ['NEUTRAL', 'STABLE', 'CONSOLIDATION'];
        if (score >= 25) return ['FEAR', 'CAUTION', 'SELLING'];
        return ['EXTREME_FEAR', 'PANIC', 'CAPITULATION', 'BEARISH'];
    }
}
