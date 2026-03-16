export interface ForecastPoint {
    time: string;
    price: number;
}

export interface ForecastData {
    asset: string;
    points: ForecastPoint[];
    confidenceScore: number;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reasoning: string;
}

export class PredictiveIntelligence {
    private static instance: PredictiveIntelligence;

    private constructor() { }

    public static getInstance(): PredictiveIntelligence {
        if (!PredictiveIntelligence.instance) {
            PredictiveIntelligence.instance = new PredictiveIntelligence();
        }
        return PredictiveIntelligence.instance;
    }

    public async getForecast(asset: string): Promise<ForecastData> {
        // Simulated ML Forecasting logic
        const basePrice = asset.includes('BTC') ? 64000 : asset.includes('ETH') ? 3400 : 145;
        const now = new Date();

        const points: ForecastPoint[] = [];
        for (let i = 1; i <= 6; i++) {
            const forecastTime = new Date(now.getTime() + i * 12 * 60 * 60 * 1000); // every 12 hours
            const trend = Math.random() > 0.4 ? 1.01 : 0.99; // Slight upward bias for demo
            const predictedPrice = basePrice * Math.pow(trend, i);

            points.push({
                time: forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: predictedPrice
            });
        }

        return {
            asset,
            points,
            confidenceScore: 85 + Math.random() * 10,
            sentiment: Math.random() > 0.3 ? 'BULLISH' : 'NEUTRAL',
            reasoning: "Whale accumulation detected in dark-pools combined with rising dev activity on core repositories."
        };
    }

    public getValuationProjections(currentAUM: number) {
        return [
            { year: 'Now', value: currentAUM },
            { year: '1 YR', value: currentAUM * 1.25 },
            { year: '5 YR', value: currentAUM * 2.8 },
            { year: '10 YR', value: currentAUM * 6.2 },
        ];
    }
}
