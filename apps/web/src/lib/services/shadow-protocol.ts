export interface DarkPoolTrade {
    id: string;
    asset: string;
    amount: string;
    value: string;
    type: 'OTC' | 'DARK_POOL';
    institution: string;
    timestamp: number;
    intensity: number; // 0-100 score of "Smart Money" significance
}

export interface WarRoomScenario {
    id: string;
    name: string;
    description: string;
    impact: {
        portfolio: number; // percentage change
        riskScore: number;
        suggestedHedge: string;
    };
}

export async function getDarkPoolData(): Promise<DarkPoolTrade[]> {
    // Mocking high-frequency institutional data
    return [
        { id: '1', asset: 'BTC', amount: '450.5', value: '$42.3M', type: 'DARK_POOL', institution: 'Goldman Sachs', timestamp: Date.now() - 1000 * 60 * 5, intensity: 85 },
        { id: '2', asset: 'ETH', amount: '12,500', value: '$31.2M', type: 'OTC', institution: 'Cumberland', timestamp: Date.now() - 1000 * 60 * 12, intensity: 72 },
        { id: '3', asset: 'SOL', amount: '85,000', value: '$12.1M', type: 'DARK_POOL', institution: 'Jump Trading', timestamp: Date.now() - 1000 * 60 * 25, intensity: 91 },
        { id: '4', asset: 'BTC', amount: '310.2', value: '$29.1M', type: 'OTC', institution: 'B2C2', timestamp: Date.now() - 1000 * 60 * 45, intensity: 65 },
    ];
}

export async function runWarRoomSimulation(input: string): Promise<WarRoomScenario[]> {
    // Simulated AI response based on 10,000 Monte Carlo runs
    return [
        {
            id: 'sim_1',
            name: 'Flash Crash Event',
            description: input,
            impact: {
                portfolio: -14.2,
                riskScore: 88,
                suggestedHedge: 'Buy $25k Put Options on BTC, Increase USDT stable-pool allocation to 40%.'
            }
        }
    ];
}
