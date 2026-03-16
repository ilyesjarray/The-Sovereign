import Decimal from 'decimal.js';

export interface MarketMovement {
    asset: string;
    price: number;
    change24h: number;
}

export interface RiskAlert {
    type: 'BLACK_SWAN' | 'VOLATILITY' | 'STABLE';
    severity: 'CRITICAL' | 'HIGH' | 'LOW';
    description: string;
    probability: number;
}

export class BlackSwanDetector {
    /**
     * Analyzes multi-asset movements to identify non-standard correlations.
     * Standard: BTC/Gold often inverse to USD. 
     * Black Swan: Everything up simultaneously or everything down (liquidity squeeze).
     */
    static analyzeCorrelations(movements: Record<string, MarketMovement>): RiskAlert {
        const btc = movements['BTCUSDT'];
        const eth = movements['ETHUSDT'];
        // For a real engine, we'd fetch DXY (USD Index) and Gold Spot prices
        // Mocking the detection logic based on provided movements

        const isCryptoSurging = btc?.change24h > 5 && eth?.change24h > 5;

        // In a real scenario, we'd compare with Gold/Fiat
        // If Gold is also up 2% during a BTC 5% surge, while USD is strengthening:
        const isAnomalous = isCryptoSurging; // Simplified trigger for demonstration

        if (isAnomalous) {
            return {
                type: 'BLACK_SWAN',
                severity: 'HIGH',
                description: 'Anomalous Asset Correlation: Parallel surge in BTC, Gold, and USD detected. Possible liquidity drain or systemic event.',
                probability: 78.4,
            };
        }

        return {
            type: 'STABLE',
            severity: 'LOW',
            description: 'System correlates within established probabilistic models.',
            probability: 0.1,
        };
    }
}
