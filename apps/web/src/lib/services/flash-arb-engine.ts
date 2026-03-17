import { toast } from 'sonner';

export interface Opportunity {
    id: string;
    pair: string;
    exchanges: [string, string]; // [buyFrom, sellTo]
    buyPrice: number;
    sellPrice: number;
    spread: number;
    expectedProfit: number;
    fees: number;
    gasPrice?: number;
    timestamp: number;
}

interface TradeRecord {
    id: string;
    botId: string;
    asset: string;
    type: string;
    amount: number;
    price: number;
    profit: number;
    timestamp: number;
}

export class FlashArbEngine {
    private static instance: FlashArbEngine;
    private isAutoMode: boolean = false;
    private sessionLoss: number = 0;
    private maxSessionLossPct: number = 0.02; // 2%
    private minProfitMargin: number = 10; // $10 min profit after fees
    private slippageLimit: number = 0.005; // 0.5%
    private tradeLog: TradeRecord[] = [];
    private botProfits: Map<string, number> = new Map();

    private constructor() { }

    public static getInstance(): FlashArbEngine {
        if (!FlashArbEngine.instance) {
            FlashArbEngine.instance = new FlashArbEngine();
        }
        return FlashArbEngine.instance;
    }

    public setAutoMode(mode: boolean) {
        this.isAutoMode = mode;
        toast.info(`Execution mode: ${mode ? 'AUTOMATED' : 'MANUAL'}`);
    }

    public async scanOpportunities(): Promise<Opportunity[]> {
        // Simulated scanning logic
        const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
        const exchanges = ['Binance', 'Kraken', 'Uniswap V3', 'Coinbase'];

        const opportunities: Opportunity[] = [];

        for (const pair of pairs) {
            const basePrice = pair.includes('BTC') ? 64000 : pair.includes('ETH') ? 3400 : 145;

            // Randomly generate spreads
            const buyEx = exchanges[Math.floor(Math.random() * exchanges.length)];
            let sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];
            while (sellEx === buyEx) sellEx = exchanges[Math.floor(Math.random() * exchanges.length)];

            const buyPrice = basePrice * (1 - Math.random() * 0.003); // Slight discount
            const sellPrice = basePrice * (1 + Math.random() * 0.004); // Slight premium
            const spread = ((sellPrice - buyPrice) / buyPrice) * 100;

            const fees = (buyPrice + sellPrice) * 0.001; // 0.1% fee on each side
            const expectedProfit = (sellPrice - buyPrice) * 1 - fees; // Assuming 1 unit trade

            opportunities.push({
                id: Math.random().toString(36).substring(7),
                pair,
                exchanges: [buyEx, sellEx],
                buyPrice,
                sellPrice,
                spread,
                expectedProfit,
                fees,
                gasPrice: buyEx === 'Uniswap V3' || sellEx === 'Uniswap V3' ? Math.random() * 50 + 20 : undefined,
                timestamp: Date.now()
            });
        }

        return opportunities;
    }

    public async validateViability(opp: Opportunity): Promise<{ viable: boolean; reason?: string }> {
        // 1. Threshold Detection: SP > F + M
        if (opp.expectedProfit < this.minProfitMargin) {
            return { viable: false, reason: `Profit ($${opp.expectedProfit.toFixed(2)}) below min margin ($${this.minProfitMargin})` };
        }

        // 2. Gas Optimization (DeFi only)
        if (opp.gasPrice) {
            const gasCostUsd = opp.gasPrice * 0.5; // Dummy calculation
            if (gasCostUsd > opp.expectedProfit * 0.2) {
                return { viable: false, reason: 'Gas cost exceeds 20% of profit' };
            }
        }

        // 3. Slippage/Safety Protocols
        const slippage = Math.random() * 0.01; // Simulated real-time slippage
        if (slippage > this.slippageLimit) {
            return { viable: false, reason: `Slippage (${(slippage * 100).toFixed(2)}%) exceeds limit (0.5%)` };
        }

        // 4. Stop-Loss check
        if (this.sessionLoss > 1000) { // Example hard limit
            return { viable: false, reason: 'Session hard-loss limit reached. SHIELD ACTIVE.' };
        }

        return { viable: true };
    }

    public async executeTrade(opp: Opportunity, botId: string) {
        try {
            // Simulate execution latency
            await new Promise(r => setTimeout(r, 600));

            // Record trade in-memory
            const trade: TradeRecord = {
                id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                botId,
                asset: opp.pair,
                type: 'BUY_SELL_ARB',
                amount: 1,
                price: opp.buyPrice,
                profit: opp.expectedProfit,
                timestamp: Date.now(),
            };

            this.tradeLog.push(trade);

            // Update bot profit tracker
            const currentProfit = this.botProfits.get(botId) || 0;
            this.botProfits.set(botId, currentProfit + opp.expectedProfit);

            this.sessionLoss += opp.expectedProfit < 0 ? Math.abs(opp.expectedProfit) : 0;

            toast.success(`Arb Executed: ${opp.pair} +$${opp.expectedProfit.toFixed(2)}`, {
                description: `Exchanges: ${opp.exchanges[0]} -> ${opp.exchanges[1]} | TX: 0x${Math.random().toString(16).slice(2, 10)}...`
            });

            return trade;
        } catch (error) {
            console.error('Execution Error:', error);
            toast.error('Execution Registry Failed');
        }
    }

    public getSessionStats() {
        return {
            sessionLoss: this.sessionLoss,
            isShieldActive: this.sessionLoss > 1000
        };
    }

    public getTradeLog() {
        return this.tradeLog;
    }
}
