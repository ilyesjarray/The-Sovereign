
export type UserTier = 'GUEST' | 'PRO' | 'ELITE';

export interface ImperialAsset {
    id: string;
    symbol: string;
    name: string;
    balance: number;
    price: number;
    change24h: number;
    value: number;
    category: 'CRYPTO' | 'FIAT' | 'METAL' | 'EQUITY';
}

export interface TradeOrder {
    id: string;
    assetId: string;
    type: 'BUY' | 'SELL';
    amount: number;
    priceAtExecution: number;
    timestamp: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface IntelligenceAlert {
    id: string;
    title: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    summary: string;
    country: string;
    timestamp: string;
    sentimentScore: number; // -1 to 1
}

export interface OperationalNode {
    id: string;
    name: string;
    type: 'FLEET' | 'FORGE' | 'RELAY' | 'NODE';
    status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
    load: number;
    capacity: number;
    locationName: string;
    location: { lat: number, lng: number };
    lastActive?: string;
}

export interface BioMetrics {
    heartRate: number;
    neuralLoad: number;
    oxygenLevel: number;
    recoveryFactor: number;
    timestamp: string;
}
