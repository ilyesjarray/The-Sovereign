export interface BinanceTrade {
    id: number;
    price: string;
    qty: string;
    quoteQty: string;
    time: number;
    isBuyerMaker: boolean;
}

export interface WhaleAlert {
    id: string;
    symbol: string;
    amount: number;
    valueUsd: number;
    type: 'BUY' | 'SELL';
    timestamp: number;
    exchange: 'BINANCE';
}

export class WhaleTrackerService {
    private static instance: WhaleTrackerService;
    private baseUrl = 'https://api.binance.com/api/v3';
    private whaleThreshold = 100000; // $100k minimum

    public static getInstance() {
        if (!this.instance) this.instance = new WhaleTrackerService();
        return this.instance;
    }

    async getRecentWhaleTrades(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']): Promise<WhaleAlert[]> {
        try {
            const trades = await Promise.all(
                symbols.map(symbol => this.fetchRecentTrades(symbol))
            );

            const whaleAlerts: WhaleAlert[] = [];

            trades.forEach((symbolTrades, idx) => {
                const symbol = symbols[idx];
                const largeTrades = symbolTrades.filter(trade => {
                    const valueUsd = parseFloat(trade.quoteQty);
                    return valueUsd >= this.whaleThreshold;
                });

                largeTrades.forEach(trade => {
                    whaleAlerts.push({
                        id: `${symbol}-${trade.id}`,
                        symbol: symbol.replace('USDT', ''),
                        amount: parseFloat(trade.qty),
                        valueUsd: parseFloat(trade.quoteQty),
                        type: trade.isBuyerMaker ? 'SELL' : 'BUY',
                        timestamp: trade.time,
                        exchange: 'BINANCE'
                    });
                });
            });

            return whaleAlerts
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10);
        } catch (error) {
            console.error('[Whale Tracker]: Detection error', error);
            return [];
        }
    }

    private async fetchRecentTrades(symbol: string): Promise<BinanceTrade[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/trades?symbol=${symbol}&limit=100`
            );
            if (!response.ok) throw new Error('Binance API error');
            return response.json();
        } catch (error) {
            console.warn(`[Whale Tracker]: ${symbol} feed unavailable`, error);
            return [];
        }
    }
}
